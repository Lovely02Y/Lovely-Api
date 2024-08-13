const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const imgs = '/opt/1panel/apps/lsky-pro/lsky-pro/data/storage/app/uploads/2'; // 更改为本地存储图片的文件夹路径
const sese = '/opt/1panel/apps/lsky-pro/lsky-pro/data/storage/app/uploads/3'; // 更改为本地存储图片的文件夹路径

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

// 路由处理
router.get('/imgs', (req, res) => {
    sendRandomImage(imgs, res);
});

router.get('/sese', (req, res) => {
    sendRandomImage(sese, res);
});

module.exports = router;
