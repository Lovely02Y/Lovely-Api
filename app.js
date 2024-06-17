const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 7007; // 要更改为你需要的对外端口号

const imagesFolder = ''; // 要更改为你本地存储图片的文件夹路径

app.get('', (req, res) => {
    fs.readdir(imagesFolder, (err, files) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        const randomIndex = Math.floor(Math.random() * files.length);
        const randomImage = files[randomIndex];
        const imagePath = path.join(imagesFolder, randomImage);

        res.sendFile(imagePath);
    });
});

// 监听端口
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
