import { PythonShell } from 'python-shell';

PythonShell.run('test.py', null, function (err) {
	if (err) throw err;
	console.log('finished');
});
