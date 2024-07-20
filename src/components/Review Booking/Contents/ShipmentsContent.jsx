import { useQueryClient } from '@tanstack/react-query';
import { Button, Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { GET_ALL_ORDERS_URL, GET_ALL_SHIPMENTS, GET_SHIPMENT_BY_ORDERID_URL } from '../../../api/apiUrls';
import axios from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';

function ShipmentsContent() {
    const { authUser } = useAuth();

    const [ordersData, setOrdersData] = useState([]);
    const [shipmentsData, setShipmentsData] = useState([]);
    const [shipmentsFinalData, setShipmentsFinalData] = useState([]);

    const getAllOrders = async () => {
        const response = await axios.get(GET_ALL_ORDERS_URL);
        // setOrdersData(response.data.results);
        response.data.results.forEach(async (item) => {
            var day = await getShipmentByOrderId(item.order_id);
            console.log("day: ", day);
        })
        console.log("setOrdersData: ", response.data);
    };

    const getShipmentByOrderId = async (orderId) => {
        const response = await axios.get(GET_SHIPMENT_BY_ORDERID_URL, {
            params: {
                orderid: orderId
            }
        });
        console.log("getShipmentByOrderId: ", response.data);
        return response.data
    }


    useEffect(() => {
        getAllOrders();
    }, [])



    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text ? text : "-"}</a>,
        },
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            key: 'order_id',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Shipment Received',
            responsive: ['sm', 'md', 'lg'],
            render: (text) => <a>{text == 'Yes' ? 'Received' : 'Not Received'}</a>,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            responsive: ['sm', 'md', 'lg'],
        },
    ];

    const data = [
        {
            key: '1',
            name: 'John Brown',
            age: 'Yes',
            action: (
                <>
                    <div className="row">
                        {/* {item.renter_company_id == authUser.CompanyId && */}
                        <div className="col">
                            <Button>Review Shipment Materials</Button>
                        </div>
                        {/* } */}

                        {/* {item.hirer_company_id == authUser.CompanyId && */}
                        <div className="col">
                            <Button type='primary'>Ship Materials to Renter</Button>
                        </div>
                        {/* } */}

                        <div className="col"></div>
                    </div>
                </>
            )
        },
    ];
    return (
        <>
            <div className="container-fluid">
                <Table
                    columns={columns}
                    dataSource={ordersData}
                    bordered
                    title={() => 'Shipment'}
                />
            </div>
        </>
    )
}

export default ShipmentsContent