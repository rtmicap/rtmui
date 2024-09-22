import { Button, Descriptions, Space } from 'antd';
import React from 'react'
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

function OrderDetailPage() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order } = location.state || {};

    if (!order) {
        return <div>No order data found!</div>;
    }
    // console.log("order: ", order);

    const items = [
        {
            label: 'Order ID',
            children: order.order_id,
        },
        {
            label: 'Order Status',
            children: order.order_Status,
        },
        {
            label: 'Goods Status',
            children: order.goods_status,
        },
        {
            label: 'Quantity',
            children: order.quantity,
        },
        {
            label: 'Planned Hours',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: order.planned_hours,
        },
    ];

    return (
        <>
            <div className="container">
                {/* <table className="table table-bordered table-striped caption-top">
                    <caption style={{ fontWeight: 'bold', color: '#774AEF' }}>Order Details</caption>
                    <tr>
                        <th>Order ID</th>
                        <th>Order Status</th>
                    </tr>
                    <tr>
                        <td>{order.order_id}</td>
                        <td>{order.order_status}</td>
                    </tr>
                </table> */}
                <Descriptions
                    title="Order Descriptions"
                    bordered
                    column={{
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 3,
                        xl: 4,
                        xxl: 4,
                    }}
                    items={items}
                />

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Space>
                        {authUser.CompanyId == order.hirer_company_id &&
                            <Button type="primary">Ship Materials To Renter</Button>
                        }

                        {authUser.CompanyId == order.renter_company_id &&
                            <Button type="primary">Review Ship Materials</Button>
                        }
                        {/* <Button type="default" onClick={() => handleView(order)}>View</Button>
                        <Button type="danger" onClick={() => handleDelete(order)}>Delete</Button> */}
                    </Space>
                </div>
            </div>
        </>
    )
}

export default OrderDetailPage