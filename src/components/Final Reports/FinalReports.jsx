import { Button } from 'antd';
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LeftCircleOutlined } from "@ant-design/icons";

function FinalReports() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order } = location.state || {};
    const navigate = useNavigate();

    return (
        <>
            <div className="container">
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
                <h5 className='text-center'>Final Report for Order ID: {order.order_id}</h5>
                <hr />
            </div>
        </>
    )
}

export default FinalReports