// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import multer from 'multer';
import initMiddleware from '../../utils/initMiddleware';
const fs = require('fs-extra');
require('dotenv').config();
const limits = {
	files: 1, // allow only 1 file per request
	fileSize: 500 * 1024 * 1024, // 500 MB (max file size)
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, process.env.UPLOAD_DIR);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	},
});

const upload = multer({ storage, limits });

// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
const multerAny = initMiddleware(upload.any());

// Doc on custom API configuration:
// https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export const config = {
	api: {
		bodyParser: false,
	},
};

export default async (req, res) => {
	await fs.ensureDir(process.env.UPLOAD_DIR);
	if (req.method === 'POST') {
		try {
			await multerAny(req, res);
			// console.log(req.files);
			res.json(
				JSON.stringify(
					req.files.map((f) => {
						return { name: f.filename, size: f.size };
					})
				)
			);
		} catch (err) {
			res.status(500).send(err);
		}
	}
};
