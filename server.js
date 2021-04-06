require('dotenv').config();
const { UPLOAD_DIR, OUTPUT_DIR, FS_PORT } = process.env;
// const fs = require('fs-extra');
const express = require('express');
const proxy = require('express-http-proxy');

const path = require('path');
const app = express();
const CWD = process.cwd();
// fs.ensureDirSync(UPLOAD_DIR);

app.use('/processed', express.static(path.join(CWD, 'processed')));
app.all(
	'*',
	proxy('localhost:3000', {
		limit: '500mb',
	})
);

console.log(path.join(CWD, 'processed'));

console.log('Sever started on port', FS_PORT);
app.listen(FS_PORT);
