import { useState } from 'react';
import UploadImage from '../../components/common/elements/UploadImage';
import { message } from 'antd';

const UploadImageExample = () => {
    const [imageUrl, setImageUrl] = useState('');
    
    const handleChange = (file, url) => {
      setImageUrl(url);
      console.log('File uploaded:', file);
      console.log('Image URL:', url);
      message.success(`${file.name} uploaded successfully!`);
    };
    
    /* const handlePreview = (url) => {
      console.log('Preview image:', url);
    }; */
    
    const handleRemove = () => {
      setImageUrl('');
      console.log('Image removed');
      message.info('Image has been removed');
    };
    
    return (
      <div className="example-container">
        <h2>Upload Image Component Example</h2>
        
        <h3>Basic Usage with Remove</h3>
        <UploadImage 
          value={imageUrl}
          onChange={handleChange}
          onRemove={handleRemove}
          showRemoveButton={true}
        />
        
        <h3>Custom Remove Button Text</h3>
        <UploadImage 
          value={imageUrl}
          onChange={handleChange}
          onRemove={handleRemove}
          showRemoveButton={true}
          removeButtonText="Delete Image"
          removeConfirmText="Are you sure you want to delete this image?"
        />
        
        <h3>Without Remove Button</h3>
        <UploadImage 
          value={imageUrl}
          onChange={handleChange}
          showRemoveButton={false}
        />
      </div>
    );
  };
  export default UploadImageExample;