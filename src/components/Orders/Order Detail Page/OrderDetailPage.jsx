import { Button, Descriptions, message, Space, Tag, Timeline } from 'antd';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LeftCircleOutlined } from "@ant-design/icons";
import axios from '../../../api/axios';
import { GET_COMPANY_DETAILS_BY_ID } from '../../../api/apiUrls';
import HirerOrdersDetailPage from './HirerOrdersDetailPage';
import RenterOrdersDetailPage from './RenterOrdersDetailPage';

function OrderDetailPage() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order } = location.state || {};

    const currentUserCompanyId = authUser.CompanyId;

    if (!order) {
        return <div>No order data found!</div>;
    }
    console.log("order: ", order);

    return (
        <>
            <div>
                {authUser && currentUserCompanyId == order.hirer_company_id ?
                    <HirerOrdersDetailPage />
                    : authUser && currentUserCompanyId == order.renter_company_id ?
                        <RenterOrdersDetailPage />
                        : <h4 className='text-center'>Something went wrong</h4>
                }
            </div>
        </>
    )
}

export default OrderDetailPage