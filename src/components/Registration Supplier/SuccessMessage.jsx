import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function SuccessMessage() {
    const navigate = useNavigate();
    return (
        <>
            <Result
                status="success"
                title="Thank you for registering with us. We will verify the details
                and revert with your unique login credentials upon approval
                within 72 hours."
                extra={[
                    <Button type="primary" key="console" onClick={() => navigate('/')}>
                        Go to Homepage
                    </Button>,
                    // <Button key="buy">Buy Again</Button>,
                ]}
            />
        </>
    )
}

export default SuccessMessage