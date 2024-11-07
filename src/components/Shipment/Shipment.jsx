import { Button, DatePicker, Form, message, Select, Spin, Upload, Input, notification, Tooltip, Flex, Collapse } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    MinusCircleOutlined,
    SyncOutlined,
    ReloadOutlined,
    PlusCircleOutlined,
    PlusOutlined,
    CloseOutlined,
    PaperClipOutlined,
    UploadOutlined,
    LoadingOutlined
} from '@ant-design/icons';
const { TextArea } = Input;
import React, { useEffect, useState } from 'react';
import { LeftCircleOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import { CREATE_SHIPMENT_URL, FILE_UPLOAD_URL, GET_SHIPMENT_BY_ORDERID_URL, UPDATE_SHIPMENT_URL } from '../../api/apiUrls';
import dayjs from 'dayjs';
import { formattedDateTime } from '../../utils/utils';
import moment from 'moment/moment';
import HirerShipmentPage from './Details Page/HirerShipmentPage';
import RenterShipmentPage from './Details Page/RenterShipmentPage';

function Shipment() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewShipment } = location.state || {};
    const navigate = useNavigate();
    const currentUserCompanyId = authUser && authUser.CompanyId;
    return (
        <>
            {authUser && currentUserCompanyId == order.hirer_company_id ?
                <HirerShipmentPage />
                : authUser && currentUserCompanyId == order.renter_company_id ?
                    <RenterShipmentPage />
                    : <h4 className='text-center'>Something went wrong</h4>
            }
        </>
    )
}

export default Shipment