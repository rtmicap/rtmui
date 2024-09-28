import { Button, Descriptions, Space, Tag } from 'antd';
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LeftCircleOutlined } from "@ant-design/icons";

function OrderDetailPage() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order } = location.state || {};
    const navigate = useNavigate();

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
                    <span>Company Name({order.hirer_company_id})</span>
                </>
            ),
        },
        {
            label: 'Renter Company ID',
            children: (
                <>
                    <span>Company Name({order.renter_company_id})</span>
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