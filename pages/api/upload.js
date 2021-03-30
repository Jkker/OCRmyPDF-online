// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import multer from 'multer';
import initMiddleware from '../../utils/initMiddleware';
const fs = require('fs-extra');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	},
});

const upload = multer({ storage: storage, dest: 'uploads/' });

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
	fs.ensureDir('uploads/');
	if (req.method === 'POST') {
		try {
			await multerAny(req, res);
			console.log(req.files);
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
