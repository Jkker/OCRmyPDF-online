const fs = require('fs-extra');
const path = require('path');
const which = require('which');

export default async (req, res) => {
	fs.ensureDir('uploads/');
	try {
		const ocrmypdf = await which('ocrmypdf');
    console.log(ocrmypdf);
		if (req.method === 'GET') {
			const { f } = req.query;
			const exists = await fs.pathExists(path.join('uploads', f));
			if (exists) {
				res.send('Found file');
			} else {
				res.status(404).send('File not found');
			}
		}
	} catch (err) {
		res.status(500).send(err.toString());
		return false;
	}
};
