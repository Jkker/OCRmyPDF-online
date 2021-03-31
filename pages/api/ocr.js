const fs = require('fs-extra');
const path = require('path');
const which = require('which');
const util = require('util');
const { exec } = require('child_process');
const execProm = util.promisify(exec);
require('dotenv').config();
const { UPLOAD_DIR, OUTPUT_DIR, DOMAIN, FS_PORT } = process.env;
const CWD = process.cwd();

async function runShellCommand(command) {
	let result;
	try {
		result = await execProm(command);
		return { stdout: result, success: true };
	} catch (err) {
		return { success: false, stdout: err };
	}
}

export default async (req, res) => {
	await fs.ensureDir(UPLOAD_DIR);
	await fs.ensureDir(path.join(CWD, OUTPUT_DIR));
	try {
		const ocrmypdf = await which('ocrmypdf');

		if (req.method === 'GET') {
			let { f, opt, lang } = req.query;
			console.log(opt, lang);
			const inputPath = path.join(CWD, UPLOAD_DIR, f);
			const outputPath = path.join(CWD, OUTPUT_DIR, f);
			const publicPath = path.join(OUTPUT_DIR, f);
			const inputExists = await fs.pathExists(inputPath);
			const outputExists = await fs.pathExists(outputPath);
			// if (outputExists) {
			// 	res.json(JSON.stringify({ url: publicPath, name: f }));
			// 	return;
			// }
			if (Array.isArray(lang)) {
				lang = lang.join('+');
			}
			if (Array.isArray(opt)) {
				opt = opt.join(' ');
			}
			if (inputExists) {
				const cmd = `${ocrmypdf} ${lang ? '-l ' + lang : ''} ${
					opt ?? ''
				} "${inputPath}" "${outputPath}"`;
				console.log(cmd);
				// const ls = await runShellCommand('ls -la');
				// console.log(ls);
				const out = await runShellCommand(cmd);
				console.log(out);
				res.json(
					JSON.stringify({
						success: out.success,
						cmd,
						stdout: out.stdout,
						url: out.success ? publicPath : false,
						name: f,
					})
				);
			} else {
				res.status(404).send('File not found');
			}
		}
	} catch (err) {
		res.status(500).send(err.toString());
		return false;
	}
};
