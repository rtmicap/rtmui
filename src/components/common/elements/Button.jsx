import { Button as AntButton } from 'antd';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = ({
  children,
  type,
  size,
  icon,
  loading,
  disabled,
  block,
  danger,
  ghost,
  shape,
  className,
  style,
  onClick,
  onMouseOver,
  onMouseOut,
  htmlType,
}) => {
  // Handle click event
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  // Handle mouse over event
  const handleMouseOver = (e) => {
    if (onMouseOver) {
      onMouseOver(e);
    }
  };

  // Handle mouse out event
  const handleMouseOut = (e) => {
    if (onMouseOut) {
      onMouseOut(e);
    }
  };

  return (
    <AntButton
      type={type}
      size={size}
      icon={icon}
      loading={loading}
      disabled={disabled}
      block={block}
      danger={danger}
      ghost={ghost}
      shape={shape}
      className={`custom-button ${className || ''}`}
      style={style}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      htmlType={htmlType}
    >
      {children}
    </AntButton>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['primary', 'default', 'dashed', 'text', 'link']),
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  icon: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  block: PropTypes.bool,
  danger: PropTypes.bool,
  ghost: PropTypes.bool,
  shape: PropTypes.oneOf(['default', 'circle', 'round']),
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  htmlType: PropTypes.oneOf(['submit', 'button', 'reset']),
};

Button.defaultProps = {
  type: 'default',
  size: 'middle',
  loading: false,
  disabled: false,
  block: false,
  danger: false,
  ghost: false,
  shape: 'default',
  htmlType: 'button',
};

export default Button;