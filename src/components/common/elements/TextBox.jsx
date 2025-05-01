import { useState } from 'react';
import { Input } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './TextBox.scss';

const TextBox = ({
  id,
  name,
  value,
  placeholder,
  disabled,
  readOnly,
  maxLength,
  prefix,
  suffix,
  className,
  style,
  size,
  type,
  allowTogglePassword,
  onChange,
  onFocus,
  onBlur,
  onPressEnter,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Handle change event
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  // Handle focus event
  const handleFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    }
  };

  // Handle blur event
  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle press enter event
  const handlePressEnter = (e) => {
    if (onPressEnter) {
      onPressEnter(e);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(prevVisible => !prevVisible);
  };

  // Generate password toggle icon if applicable
  const getPasswordIcon = () => {
    if (type === 'password' && allowTogglePassword) {
      return passwordVisible ? (
        <EyeOutlined onClick={togglePasswordVisibility} />
      ) : (
        <EyeInvisibleOutlined onClick={togglePasswordVisibility} />
      );
    }
    return suffix;
  };

  // Determine which Input component to use
  const renderInput = () => {
    const commonProps = {
      id,
      name,
      value,
      placeholder,
      disabled,
      readOnly,
      maxLength,
      prefix,
      className: "textbox-component",
      size,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onPressEnter: handlePressEnter,
    };

    if (type === 'password') {
      return (
        <Input.Password
          {...commonProps}
          visibilityToggle={allowTogglePassword}
          iconRender={visible => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        />
      );
    } else {
      return (
        <Input
          {...commonProps}
          type={type}
          suffix={suffix}
        />
      );
    }
  };

  return (
    <div className={`textbox-wrapper ${className || ''}`} style={style}>
      {renderInput()}
      {maxLength && value && (
        <div className="textbox-char-count">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

TextBox.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  maxLength: PropTypes.number,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url']),
  allowTogglePassword: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onPressEnter: PropTypes.func,
};

TextBox.defaultProps = {
  disabled: false,
  readOnly: false,
  size: 'middle',
  type: 'text',
  allowTogglePassword: true,
};

export default TextBox;