import { Button, Descriptions, message, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LeftCircleOutlined } from "@ant-design/icons";
import axios from '../../../api/axios';
import { GET_COMPANY_DETAILS_BY_ID } from '../../../api/apiUrls';

function OrderDetailPage() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order } = location.state || {};
    const navigate = useNavigate();
    const [hirerCompany, setHirerCompany] = useState(null);
    const [renterCompany, setRenterCompany] = useState(null);

    const getCompanyDetailsById = async (companyId, setter) => {
        try {
            const response = await axios.get(GET_COMPANY_DETAILS_BY_ID, {
                params: { companyId }
            });
            console.log("company details: ", response.data.data);
            setter(response.data.data);
        } catch (error) {
            message.error("Error fetching Company Details");
        }
    };

    useEffect(() => {
        getCompanyDetailsById(order.hirer_company_id, setHirerCompany);
        getCompanyDetailsById(order.renter_company_id, setRenterCompany);
    }, [])


    if (!order) {
        return <div>No order data found!</div>;
    }
    console.log("order: ", order);

    const items = [
        {
            label: 'Order ID',
            children: order.order_id,
        },
        {
            label: 'Order Status',
            children: (
                <>
                    <Tag color={'teal'}>{order.order_status.toUpperCase()}</Tag>
                </>
            )

        },
        {
            label: 'Goods Status',
            children:
                (
                    <>
                        {order.goods_status ?
                            <Tag color='magenta'>{order.goods_status.toUpperCase()}</Tag>
                            : '-'
                        }
                    </>
                )

        },
        {
            label: 'Order Quantity',
            children: order.quantity,
        },
        {
            label: 'Planned Hours',
            children: order.planned_hours,
        },
        {
            label: 'Actual Hours',
            children: order.actual_hours,
        },
        {
            label: 'Hirer Company ID',
            children: (
                <>
                    <span>{hirerCompany ? `${hirerCompany.companyName} (${order.hirer_company_id})` : '-'}</span>
                </>
            ),
        },
        {
            label: 'Renter Company ID',
            children: (
                <>
                    <>
                        <span>{renterCompany ? `${renterCompany.companyName} (${order.renter_company_id})` : '-'}</span>
                    </>
                </>
            ),
        },
    ];

    return (
        <>
            <div className="container">
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button><hr />

                <Descriptions
                    title="Order Descriptions"
                    bordered
                    column={{
                        xs: 1,
                        sm: 2,
                        md: 2,
                        lg: 2,
                        xl: 2,
                        xxl: 2,
                    }}
                    items={items}
                />

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Space>
                        {authUser && authUser.CompanyId == order.hirer_company_id &&
                            <button type='button' className="btn btn-primary btn-sm">
                                Ship Materials To Renter
                            </button>
                        }

                        {authUser && authUser.CompanyId == order.renter_company_id &&
                            <button type='button' className="btn btn-primary btn-sm">
                                Review Ship Materials
                            </button>
                        }
                        <button type='button' className="btn btn-warning btn-sm">
                            Sample Report
                        </button>
                        <button type='button' className="btn btn-dark btn-sm">
                            Final Report
                        </button>
                    </Space>
                </div>
            </div>
        </>
    )
}

export default OrderDetailPage