const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const videos = '/path/to/your/videos/folder'; // 更改为你本地存储视频的文件夹路径

// 创建一个函数来处理视频发送逻辑
function sendRandomVideo(folderPath, res) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        const randomIndex = Math.floor(Math.random() * files.length);
        const randomVideo = files[randomIndex];
        const videoPath = path.join(folderPath, randomVideo);
        res.sendFile(videoPath);
    });
}

// 路由处理
router.get('/loli', (req, res) => {
    sendRandomVideo(videos, res);
});

module.exports = router;
