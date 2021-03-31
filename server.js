const { UPLOAD_DIR, OUTPUT_DIR, FS_PORT } = process.env;
// const fs = require('fs-extra');
const express = require('express');
const proxy = require('express-http-proxy');

const path = require('path');
const app = express();
const CWD = process.cwd();
// fs.ensureDirSync(UPLOAD_DIR);

app.use('/processed', express.static(path.join(CWD, 'processed')));
app.all('*', proxy('localhost:3000'));

console.log(path.join(CWD, 'processed'));

console.log('Sever started on port', 10010);
app.listen(10010);
