import React, { useEffect } from "react";
import { message as toastNotification, Spin } from "antd";
import Auxiliary from "./Auxiliary";

const AppNotificationContainer = ({ loading, error, message }) => {
    const [spinning, setSpinning] = React.useState(false);

    useEffect(() => {
        setSpinning(true);
        setTimeout(() => {
            setSpinning(false);
        }, 3000);
    }, [spinning])

    return (
        <Auxiliary>
            {loading && <div>
                <Spin spinning={spinning} fullscreen />
            </div>}
            {error && toastNotification.error(<span id="message-id">{error}</span>)}
            {message && toastNotification.info(<span id="message-id">{message}</span>)}
        </Auxiliary>
    )
}

export default AppNotificationContainer;
