import React, { useState } from 'react';
import { PlusOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Image, Upload, Modal, Spin, message } from 'antd';
import uploadFileToServer from './uploadFileToServer';

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const FileUploader = ({ value = [], onChange, maxCount = 8, maxFileSizeMB = 2, acceptFile = ".pdf,.jpg,.jpeg,.png" }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [uploadPercent, setUploadPercent] = useState(0);

    const handlePreview = async (file) => {
        // Check if file is valid
        console.log("preview: ", file);
        if (!file) {
            console.error('File is undefined or invalid');
            return;
        }

        // Ensure the file has a name property to call endsWith
        // if (!file.name) {
        //     console.error('File does not have a name property');
        //     return;
        // }

        if (!file.url && !file.preview) {
            try {
                file.preview = await getBase64(file.originFileObj);
            } catch (error) {
                console.error('Error generating base64 preview:', error);
                return;
            }
        }

        if (!file.url && file.preview) {
            try {
                window.open(file.url || file.preview, '_blank');
            } catch (error) {
                console.error('Error preview:', error);
                return;
            }
        }

        // Handle PDF files
        if (file?.name?.endsWith('.pdf') || file.url || file.preview) {
            window.open(file.url || file.preview, '_blank');
        } else {
            // Handle image previews
            setPreviewImage(file.url || file.preview);
            setPreviewOpen(true);
            setPreviewTitle(file.name || '');
        }


    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const handleCustomRequest = async ({ file, onSuccess, onError, onProgress }) => {
        try {
            // console.log("handleCustomRequest: ", file);
            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadPercent(progress);
                onProgress({ percent: progress });
                if (progress >= 90) clearInterval(interval); // simulate up to 90%
            }, 100);

            const uploadedUrl = await uploadFileToServer(file, file.name);
            // console.log("uploadedUrl: ", uploadedUrl);

            clearInterval(interval);
            onProgress({ percent: 100 });
            setUploadPercent(100);

            onSuccess?.({ url: uploadedUrl }, file); // optional chaining to avoid error if undefined
            onChange([{ url: uploadedUrl }]); // Update value in parent component
        } catch (error) {
            console.error('Upload failed:', error);
            onError?.(error); // optional chaining added here
        }
    };

    const beforeUpload = (file) => {
        const isSizeValid = file.size / 1024 / 1024 < maxFileSizeMB;
        if (!isSizeValid) {
            message.error(`File must be smaller than ${maxFileSizeMB}MB!`);
        }
        return isSizeValid || Upload.LIST_IGNORE; // prevents file from being added to list
    };

    return (
        <>
            <Upload
                customRequest={handleCustomRequest}
                listType="picture-card"
                fileList={value}
                beforeUpload={beforeUpload}
                onPreview={handlePreview}
                onChange={({ fileList }) => onChange(fileList)}
                accept={acceptFile}
                progress={{
                    strokeWidth: 2,
                    showInfo: true,
                    format: percent => `${Math.round(percent)}%`,
                }}
            >
                {value.length >= maxCount ? null : uploadButton}
            </Upload>
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <Image src={previewImage} alt="preview" style={{ width: '100%' }} />
            </Modal>
        </>
    );
};

export default FileUploader;
