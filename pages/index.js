import { FilePdfOutlined, InboxOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Layout, message, Upload } from 'antd';
import Head from 'next/head';
import { useState } from 'react';
import request from 'umi-request';

const { Dragger } = Upload;

const { Header, Footer, Sider, Content } = Layout;
export default function Home() {
	const [fileList, setFileList] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
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
				if (fileList.length === 1) {
					setIsUploading(false);
				} else {
					setIsUploading(fileList.reduce((acc, f) => acc && f.status === 'uploading', true));
				}
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

	const handleOCR = (e) => {
		fileList.forEach(async (f) => {
			request
				.get('api/ocr', {
					params: {
						f: f.response[0]?.name,
					},
				})
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					message.error('Error occured');
				});
		});

		console.log('start ocr');
	};
	const validateFileType = (file, fileList) => {
		if (file.type !== 'application/pdf') {
			message.error(`${file.name} is not a PDF file`);
			file.status = 'error';
			file.response = 'Unsupported file type';
			return false;
		}
	};
	const props = {
		name: 'pdf',
		// accept: '.pdf,application/pdf',
		multiple: true,
		action: '/api/upload',
		listType: 'picture',
		fileList: fileList,
		beforeUpload: validateFileType,
		onChange: handleUploadChange,
	};
	return (
		<div>
			<Head>
				<title>OCRmyPDF Online</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<Layout className='flex flex-col min-h-screen justify-center items-center'>
				<Header className='mt-4 p-0 w-4/5 bg-transparent'>
					<h1 className='font-bold text-2xl flex items-center'>
						<FilePdfOutlined className='mr-2' />
						OCRmyPDF Online
					</h1>
				</Header>
				<Layout className='w-4/5 flex-grow'>
					<Content className='p-16 bg-white mr-4'>
						<Dragger {...props} className='w-full h-32'>
							<p className='ant-upload-drag-icon'>
								<InboxOutlined />
							</p>
							<p className='ant-upload-text'>Upload PDF</p>
						</Dragger>
					</Content>
					<Sider className='bg-white p-4'>
						<h2 className='text-xl font-bold my-2 flex items-center'>
							<SettingOutlined className='mr-2' />
							Settings
						</h2>
						<Button
							type='ghost primary'
							onClick={() => console.log(fileList)}
							className='my-2 w-full'
						>
							Log FileList
						</Button>
						<Button
							type='primary'
							onClick={handleOCR}
							loading={isUploading}
							disabled={!fileList.length}
							className='w-full my-4 '
						>
							Start OCR!
						</Button>
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
