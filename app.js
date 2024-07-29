const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 7007; // 要更改为你需要的对外端口号

const imgs = '/opt/1panel/apps/lsky-pro/lsky-pro/data/storage/app/uploads/2'; // 要更改为你本地存储图片的文件夹路径
const sese = '/opt/1panel/apps/lsky-pro/lsky-pro/data/storage/app/uploads/3'; // 要更改为你本地存储图片的文件夹路径

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