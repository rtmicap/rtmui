import { Button} from 'antd';
import { Children } from 'react';

function ButtonElement(props) {

    return (
       <Button className={props.className} type={props.type} htmlType={props.htmlType} onClick={props.onClick}>{props.value}</Button>
    )
}

export default ButtonElement;