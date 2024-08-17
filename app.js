const express = require('express');
const rateLimit = require('express-rate-limit');
const yaml = require('js-yaml');
const fsPromises = require('fs').promises;
const path = require('path');

const app = express();
const port = 7007; // 要更改为你需要的对外端口号

// 启用 trust proxy 以便 express-rate-limit 正确识别用户
app.set('trust proxy', 1);

// 存储 IP 请求计数
const ipRequestCounts = new Map();

// 创建一个速率限制中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 90, // 每个 IP 每个窗口最多允许 90 个请求
  message: '你小子不准爬了哦！！！ 你爬的太多啦！！！'
});

// 定义一个函数来获取当前时间并格式化
function getCurrentTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString();
    const timeString = now.toLocaleTimeString();
    return `${dateString} ${timeString}`;
}

// 中间件函数：检查是否在白名单或黑名单中
async function checkLists(req, res, next) {
    const clientIp = req.ip;
    console.log(`当前时间: ${getCurrentTime()} 访问IP: ${clientIp}`);

    const { whitelist, blacklist } = await loadConfig();

    if (blacklist.includes(clientIp)) {
        // 如果 IP 在黑名单中，直接拒绝请求
        return res.status(403).send('你小子今天爬太多了昂！！！ 给你ban了');
    }

    if (whitelist.includes(clientIp)) {
        // 如果 IP 在白名单中，直接跳过速率限制
        return next();
    }

    // 记录请求次数
    const currentTime = Date.now();
    const requestCounts = ipRequestCounts.get(clientIp) || [];
    // 只保留过去10分钟的请求记录
    const recentRequests = requestCounts.filter(timestamp => currentTime - timestamp < 10 * 60 * 1000);
    recentRequests.push(currentTime);
    ipRequestCounts.set(clientIp, recentRequests);

    // 检查是否超过了请求限制阈值（例如：每分钟超过20次请求）
    if (recentRequests.length > 20) {
        // 拉黑 IP 并更新配置文件
        await addToBlacklist(clientIp);

        return res.status(403).send('你小子今天爬太多了昂！！！ 给你ban了');
    }

    // 应用速率限制中间件
    return limiter(req, res, next);
}

app.use(checkLists);

// 从 YAML 文件中读取白名单和黑名单
async function loadConfig() {
    try {
        const fileContents = await fsPromises.readFile(path.join(__dirname, 'config', 'pz.yaml'), 'utf8');
        const data = yaml.load(fileContents);
        return {
            whitelist: data.whitelist || [],
            blacklist: data.blacklist || []
        };
    } catch (err) {
        console.error('Error loading config:', err);
        return {
            whitelist: [],
            blacklist: []
        };
    }
}

// 更新配置文件中的黑名单
async function addToBlacklist(ip) {
    const config = await loadConfig();
    if (!config.blacklist.includes(ip)) {
        config.blacklist.push(ip);
        await fsPromises.writeFile(path.join(__dirname, 'config', 'pz.yaml'), yaml.dump(config), 'utf8');
    }
}

// 导入分离的路由
const imageRoutes = require('./apps/images');
const videoRoutes = require('./apps/videos');

app.use('/tp', imageRoutes); // 使用 /imgs 路由
app.use('/sp', videoRoutes); // 使用 /videos 路由

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/resources/index.html');
});

// 捕获所有未匹配的请求并重定向到根路由
app.all('*', (req, res) => {
    res.redirect('/');
});

// 监听端口
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});