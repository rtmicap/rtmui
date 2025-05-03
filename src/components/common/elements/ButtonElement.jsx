import { Button } from 'antd';
import { Children } from 'react';

function ButtonElement(props) {

    return (
        <Button className={props.className} type={props.type} htmlType={props.htmlType} onClick={props.onClick}
            icon={props.icon} key={props.key} style={props.style}
            danger={props.danger} loading={props.loading}
            block={props.block}>
            {props.value}
        </Button>
    )
}

export default ButtonElement;