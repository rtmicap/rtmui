import { useState } from 'react';
import { Upload, Button, message, Popconfirm } from 'antd';
import { /* UploadOutlined, */ LoadingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './UploadImage.scss';

const UploadImage = ({
  value,
  maxSize,
  accept,
  showUploadList,
  multiple,
  disabled,
  className,
  style,
  buttonText,
  showRemoveButton,
  removeButtonText,
  removeConfirmText,
  onChange,
  onPreview,
  onRemove,
  beforeUpload,
  customRequest,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value);
  
  // Convert file size to readable format
  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  // Handle before upload to check file size and type
  const handleBeforeUpload = (file) => {
    const isAcceptedType = accept ? accept.split(',').some(type => {
      const mimeType = type.trim();
      return file.type === mimeType || 
             (mimeType.includes('*') && file.type.startsWith(mimeType.replace('*', '')));
    }) : true;
    
    const isLessThanMaxSize = maxSize ? file.size / 1024 / 1024 < maxSize : true;
    
    if (!isAcceptedType) {
      message.error(`You can only upload ${accept} files!`);
    }
    
    if (!isLessThanMaxSize) {
      message.error(`Image must be smaller than ${maxSize}MB! Current size: ${formatFileSize(file.size)}`);
    }
    
    const canUpload = isAcceptedType && isLessThanMaxSize;
    
    if (canUpload && beforeUpload) {
      return beforeUpload(file);
    }
    
    return canUpload ? true : Upload.LIST_IGNORE;
  };
  
  // Handle change event
  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      // Get image URL from response or create a preview
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
        
        if (onChange) {
          onChange(info.file.originFileObj, url, info);
        }
      });
    }
    
    if (info.file.status === 'error') {
      setLoading(false);
      message.error(`${info.file.name} file upload failed.`);
    }
  };
  
  // Convert file to base64 for preview
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  
  // Handle preview click
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    
    if (onPreview) {
      onPreview(file.url || file.preview, file);
    } else {
      const image = new Image();
      image.src = file.url || file.preview;
      const imgWindow = window.open('');
      imgWindow.document.write(image.outerHTML);
    }
  };
  
  // Handle custom request if provided
  const handleCustomRequest = ({ file, onSuccess }) => {
    if (customRequest) {
      customRequest(file, onSuccess);
    } else {
      // Default behavior: just return success after a timeout to simulate upload
      setTimeout(() => {
        onSuccess("ok");
      }, 500);
    }
  };
  
  // Handle image removal
  const handleRemove = () => {
    setImageUrl(undefined);
    
    if (onRemove) {
      onRemove();
    }
    
    message.success('Image removed successfully!');
  };
  
  const uploadButton = (
    <div className="upload-button-container">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="upload-text">{buttonText || 'Upload'}</div>
    </div>
  );
  
  return (
    <div className={`upload-image-wrapper ${className || ''}`} style={style}>
      <Upload
        name="image"
        listType="picture-card"
        className="upload-image-uploader"
        showUploadList={showUploadList}
        beforeUpload={handleBeforeUpload}
        onChange={handleChange}
        onPreview={handlePreview}
        customRequest={handleCustomRequest}
        multiple={multiple}
        disabled={disabled}
        accept={accept}
      >
        {imageUrl ? (
          <div className="uploaded-image-container">
            <img 
              src={imageUrl} 
              alt="Uploaded" 
              className="uploaded-image" 
            />
          </div>
        ) : uploadButton}
      </Upload>
      
      {imageUrl && showRemoveButton && (
        <Popconfirm
          title={removeConfirmText || "Are you sure you want to remove this image?"}
          onConfirm={handleRemove}
          okText="Yes"
          cancelText="No"
          placement="bottom"
        >
          <Button 
            type="danger" 
            icon={<DeleteOutlined />}
            className="remove-image-button"
            disabled={disabled}
          >
            {removeButtonText || 'Remove'}
          </Button>
        </Popconfirm>
      )}
      
      {maxSize && (
        <div className="upload-hint">
          Max file size: {maxSize}MB
        </div>
      )}
    </div>
  );
};

UploadImage.propTypes = {
  value: PropTypes.string,
  maxSize: PropTypes.number,
  accept: PropTypes.string,
  showUploadList: PropTypes.bool,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  buttonText: PropTypes.string,
  showRemoveButton: PropTypes.bool,
  removeButtonText: PropTypes.string,
  removeConfirmText: PropTypes.string,
  onChange: PropTypes.func,
  onPreview: PropTypes.func,
  onRemove: PropTypes.func,
  beforeUpload: PropTypes.func,
  customRequest: PropTypes.func,
};

UploadImage.defaultProps = {
  maxSize: 5,
  accept: 'image/png,image/jpeg,image/gif',
  showUploadList: false,
  multiple: false,
  disabled: false,
  showRemoveButton: true,
};

export default UploadImage;