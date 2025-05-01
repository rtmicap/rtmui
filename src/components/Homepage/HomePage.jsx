/* import { Layout } from 'antd';
import Navbar from '../Navbar/Navbar'; */

//const { Content } = Layout;

/* const HomePage = () => {
    return (
        <Layout>
            <Navbar />
            <Content> */
               // {/* Your homepage content goes here */}
                {/* <h1>Welcome to Our Website!</h1>
                <p>This is the homepage content.</p>
            </Content>
        </Layout>
    );
}; */}

//export default HomePage;

import { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import TextBox from '../../components/common/elements/TextBox';
import '../../components/common/elements/TextBox.scss';

const TextBoxExample = () => {
  const [inputValue, setInputValue] = useState('');
  const [focusStatus, setFocusStatus] = useState('Not focused');
  
  const handleChange = (value) => {
    setInputValue(value);
    console.log('Input changed:', value);
  };
  
  const handleFocus = () => {
    setFocusStatus('Focused');
    console.log('Input focused');
  };
  
  const handleBlur = () => {
    setFocusStatus('Blurred');
    console.log('Input blurred');
  };
  
  const handlePressEnter = () => {
    console.log('Enter pressed with value:', inputValue);
  };
  
  return (
    <div className="example-container">
      <h2>TextBox Component Example</h2>
      
      <h3>Basic Usage</h3>
      <TextBox 
        placeholder="Basic input" 
        onChange={handleChange}
      />
      
      <h3>With Value and Max Length</h3>
      <TextBox 
        value={inputValue}
        placeholder="Type something..."
        maxLength={50}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPressEnter={handlePressEnter}
      />
      <p>Current value: {inputValue}</p>
      <p>Focus status: {focusStatus}</p>
      
      <h3>With Icon Prefix</h3>
      <TextBox 
        placeholder="Username"
        prefix={<UserOutlined />}
      />
      
      <h3>Disabled State</h3>
      <TextBox 
        placeholder="This input is disabled"
        disabled
      />
      
      <h3>Different Sizes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <TextBox placeholder="Small size" size="small" />
        <TextBox placeholder="Default size" />
        <TextBox placeholder="Large size" size="large" />
      </div>

<h3>Password Input</h3>
<TextBox 
  type="password"
  placeholder="Enter your password"
  onChange={handleChange}
/>

<h3>Password Input (without toggle)</h3>
<TextBox 
  type="password"
  allowTogglePassword={false}
  placeholder="Enter your password"
  onChange={handleChange}
/>

    </div>
  );
};



export default TextBoxExample;
