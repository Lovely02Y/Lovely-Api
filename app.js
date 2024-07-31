const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const yaml = require('js-yaml');
const fsPromises = require('fs').promises;

const app = express();
const port = 7007; // 要更改为你需要的对外端口号

const imgs = '/opt/1panel/apps/lsky-pro/lsky-pro/data/storage/app/uploads/2'; // 要更改为你本地存储图片的文件夹路径
const sese = '/opt/1panel/apps/lsky-pro/lsky-pro/data/storage/app/uploads/3'; // 要更改为你本地存储图片的文件夹路径

// 启用 trust proxy 以便 express-rate-limit 正确识别用户
app.set('trust proxy', 1);

// 从 YAML 文件中读取白名单和黑名单
async function loadConfig() {
    try {
        const fileContents = await fsPromises.readFile(path.join(__dirname, 'config', 'white.yaml'), 'utf8');
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

// 创建一个速率限制中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 90, // 每个 IP 每个窗口最多允许 90 个请求
  message: '你小子不准爬了哦！！！ 你爬的太多啦！！！'
});

// 获取当前时间并格式化
const now = new Date();
const dateString = now.toLocaleDateString();
const timeString = now.toLocaleTimeString();

// 中间件函数：检查是否在白名单或黑名单中
async function checkLists(req, res, next) {
    const clientIp = req.ip;
    console.log(`日期: ${dateString} 时间: ${timeString} 访问IP: ${clientIp}`);

    const { whitelist, blacklist } = await loadConfig();

    if (blacklist.includes(clientIp)) {
        // 如果 IP 在黑名单中，直接拒绝请求
        return res.status(403).send('你小子今天爬太多了昂！！！ 给你ban了');
    }

    if (whitelist.includes(clientIp)) {
        // 如果 IP 在白名单中，直接跳过速率限制
        return next();
    }

    // 否则应用速率限制中间件
    return limiter(req, res, next);
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/resources/index.html');
});

// 创建一个函数来处理图片发送逻辑
function sendRandomImage(folderPath, res) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        const randomIndex = Math.floor(Math.random() * files.length);
        const randomImage = files[randomIndex];
        const imagePath = path.join(folderPath, randomImage);

        res.sendFile(imagePath);
    });
}

// 使用中间件
app.use(checkLists);

app.get('/imgs', (req, res) => {
    sendRandomImage(imgs, res);
});

app.get('/sese', (req, res) => {
    sendRandomImage(sese, res);
});

// 捕获所有未匹配的请求并重定向到根路由
app.all('*', (req, res) => {
    res.redirect('/');
});

// 监听端口
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});