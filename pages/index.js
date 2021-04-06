import {
	DownloadOutlined,
	FilePdfOutlined,
	FileSearchOutlined,
	InboxOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Layout, message, Select, Upload } from 'antd';
import Head from 'next/head';
import { useRef, useState } from 'react';
import request from 'umi-request';
const { Dragger } = Upload;

const { Header, Footer, Sider, Content } = Layout;
export default function Home() {
	const [fileList, setFileList] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [outputList, setOutputList] = useState([]);
	const ref = useRef(null);
	const [params, setParams] = useState({});
	const [download, setDownload] = useState(false);
	const handleUploadChange = (info) => {
		const file = info.file;
		setFileList(info.fileList);
		switch (file.status) {
			case 'uploading': {
				if (!isUploading) {
					setIsUploading(true);
				}
				break;
			}
			case 'done': {
				message.success(`${file.name} uploaded successfully.`);
				if (
					fileList.length === 1 ||
					(fileList.length > 1 &&
						fileList.reduce((acc, f) => acc && f.status === 'uploading', true))
				) {
					setTimeout(() => setIsUploading(false), 500);
				}
				// console.log('ref', ref.current);
				// ref.current.fileList[0].url = 'test';
				break;
			}
			case 'error': {
				message.error(`${info.file.name} upload failed.`);
				break;
			}
			default:
				message.info(file.status);
				break;
		}
	};
	const [logs, setLogs] = useState({});

	const handleOCR = (e) => {
		setIsProcessing(true);
		fileList.forEach(async (file, idx) => {
			// console.log(idx, file);
			try {
				const res = await request.get('api/ocr', {
					params: {
						f: file.response?.[0]?.name,
						lang: params.lang,
						opt: params.opt,
					},
				});
				console.log(res);
				if (!res.success) {
					message.error(res.err?.stderr);
				} else {
					file.url = res.url;
					const newFileList = [...fileList];
					newFileList[idx] = file;
					setFileList(newFileList);
					message.success('Processing Completed!');
					setDownload(res.url);
					// window.open(res.url);
				}
				setIsProcessing(false);
				setLogs({ stdout: res.stdout?.stderr, cmd: res?.cmd });
				console.log('Command: \n' + res.cmd + '\n\n' + res.stdout?.stderr);
			} catch (err) {
				message.error('Error occured');
			}
		});

		// console.log('start ocr');
	};
	const validateFileType = (file, fileList) => {
		if (file.type !== 'application/pdf') {
			message.error(`${file.name} is not a PDF file`);
			file.status = 'error';
			file.response = 'Unsupported file type';
			return false;
		}
	};
	const checkboxOptions = [
		{ label: 'Rotate Pages 自动旋转', value: '--rotate-pages --rotate-pages-threshold 3' },
		{
			label: 'Layout Double 双页（左右并排）',
			value: "--clean --clean-final --unpaper-args '--layout double'",
		},
		{ label: 'Deskew 矫正歪斜', value: '--deskew' },
		{ label: 'Redo-OCR 重新OCR', value: '--redo-ocr' },
		{ label: 'Remove-Background 去除背景', value: '--remove-background' },
	];
	const languageOptions = [
		{ label: 'English', value: 'eng' },
		{ label: '中文（简体）', value: 'chi-sim' },
	];
	const uploadProps = {
		name: 'pdf',
		// accept: '.pdf,application/pdf',
		multiple: true,
		action: '/api/upload',
		listType: 'picture',
		fileList: fileList,
		maxCount: 1,
		beforeUpload: validateFileType,
		onChange: handleUploadChange,
		showUploadList: {
			showDownloadIcon: true,
		},
	};
	return (
		<div>
			<Head>
				<title>OCRmyPDF Online</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<Layout className='flex flex-col min-h-screen justify-center items-center'>
				<Header className='my-4 px-0 w-4/5 bg-transparent h-auto'>
					<h1 className='font-bold text-2xl flex items-center'>
						<FilePdfOutlined className='mr-2' />
						OCRmyPDF Online
					</h1>
					点击 Start OCR! 后我们会在线安排一个杰瑞帮您抄写下来 PDF 的文字内容
				</Header>
				<Layout className='w-4/5 flex-grow'>
					<Content className='p-16 bg-white mr-4 w-3/5'>
						<Dragger {...uploadProps} className='w-full h-32' ref={ref}>
							<p className='ant-upload-drag-icon'>
								<InboxOutlined />
							</p>
							<p className='ant-upload-text'>Upload PDF</p>
						</Dragger>
						<div className='p-2 bg-gray-300 my-4 font-mono text-xs overflow-ellipsis'>
							<h4 className='font-bold'>Command: </h4>
							<div>{logs?.cmd}</div>
							<br></br>
							<h4 className='font-bold'>Output: </h4>
							<div>{logs?.stdout}</div>
						</div>
					</Content>
					<Sider className='bg-white p-4 w-2/5'>
						<h2 className='text-xl font-bold my-2 flex items-center'>
							<SettingOutlined className='mr-2' />
							Settings
						</h2>
						{/* 						<Button
							type='ghost primary'
							onClick={() => console.log(fileList)}
							className='my-2 w-full'
						>
							Log FileList
						</Button>
						<Button
							type='ghost primary'
							onClick={() => console.log(outputList)}
							className='my-2 w-full'
						>
							Log OutputList
						</Button>
						<Button
							type='ghost primary'
							onClick={() => console.log(params)}
							className='my-2 w-full'
						>
							Log Params
						</Button> */}
						<div>
							<Checkbox.Group
								options={checkboxOptions}
								onChange={(v) => setParams({ ...params, opt: v })}
								value={params.opt}
								className='my-2'
							/>
							<Select
								placeholder='文档语言'
								mode='multiple'
								className='w-full my-2'
								onChange={(v) => setParams({ ...params, lang: v })}
								options={languageOptions}
								value={params.lang}
							/>
						</div>
						<Button
							type='primary'
							onClick={handleOCR}
							loading={isUploading}
							disabled={!fileList.length}
							className='w-full my-2 flex justify-center items-center'
							loading={isProcessing}
						>
							Start OCR!
							<FileSearchOutlined className='ml-2' />
						</Button>
						{download ? (
							<Button
								type='primary'
								ghost
								href={download}
								className='w-full my-4 flex justify-center items-center'
							>
								Download
								<DownloadOutlined className='ml-2' />
							</Button>
						) : null}
					</Sider>
				</Layout>
				<Footer className='py-2 mt-2'>
					Powered by{' '}
					<a href='https://ocrmypdf.readthedocs.io/' target='_blank' rel='noopener noreferrer'>
						<b>OCRmyPDF</b>
					</a>
				</Footer>
			</Layout>
		</div>
	);
}
