import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const FileUploadComponent = ({
    label,
    name,
    accept = '.pdf,.csv',
    buttonText = 'Attach File',
    maxCount = 1,
    fileSizeLimitMB = 3,
    loading,
    onFileUpload,
    handleRemoveFile
}) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleChange = async ({ fileList }) => {
        if (fileList.length === 0) {
            message.error('Please select a file to upload!');
            return;
        }

        const file = fileList[0].originFileObj;

        // Check file size
        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > fileSizeLimitMB) {
            message.error(`File size exceeds the limit of ${fileSizeLimitMB} MB`);
            return;
        }

        setFileList(fileList); // Update the fileList state
        setUploading(true);

        try {
            const fileUrl = await onFileUpload(file, name);
            if (fileUrl) {
                message.success('File uploaded successfully!');
            }
        } catch (error) {
            message.error('File upload failed!');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFileList([]);
        handleRemoveFile();
    };

    return (
        <div>
            {/* <label>{label}</label><br /> */}
            <Upload
                fileList={fileList}
                onChange={handleChange}
                onRemove={handleRemove}
                beforeUpload={() => false} // Disable Ant Design's default upload behavior
                maxCount={maxCount}
                accept={accept}
            >
                <Button type='link' icon={<UploadOutlined />} disabled={uploading || loading}>
                    {uploading ? 'Uploading...' : buttonText}
                </Button>
            </Upload>
        </div>
    );
};

export default FileUploadComponent;

