import { Collapse, Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { GET_SHIPMENT_BY_ORDERID_URL } from '../../../api/apiUrls';
import axios from '../../../api/axios';
import { formattedDateTime } from '../../../utils/utils';

function ShipmentDetails({ order_id }) {
    // shipment data
    const [shipmentData, setShipmentData] = useState([]);
    const location = useLocation();
    const { order } = location.state || {};
    console.log("order: ", order);

    const getShipmentByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${order_id}`);
            console.log("getShipmentByOrderId: ", response.data);
            const filteredDataByStatus = response.data.result.filter((data) => data.received_status);
            if (response && response.data.result.length > 0) {
                setShipmentData(response.data.result);
            } else {
                setShipmentData([]);
            }
        } catch (error) {
            message.error("Something error while fetching shipment data!");
            console.log("shipment data err: ", error);
            setShipmentData([]);
        }
    }

    useEffect(() => {
        getShipmentByOrderId();
    }, []);

    const columns = [
        // {
        //     title: 'Shipment ID',
        //     dataIndex: 'shipment_id',
        //     key: 'shipment_id',
        //     //   render: (text) => <a>{text}</a>,
        // },
        {
            title: 'Types of Goods',
            dataIndex: 'type_of_goods',
            key: 'type_of_goods',
        },
        {
            title: 'UOM',
            key: 'UOM',
            dataIndex: 'UOM',
        },
        {
            title: 'Quantity',
            key: 'quantity',
            dataIndex: 'quantity',
        },
        {
            title: 'Invoice Report',
            key: 'invoice',
            dataIndex: 'invoice',
            render: (inv) => <><Link target={'_blank'} to={inv}>View Invoice Report</Link></>,
        },
        {
            title: 'Shipment Date/Time',
            key: 'shipment_date',
            dataIndex: 'shipment_date',
            render: (date) => <>{formattedDateTime(date)}</>,
        },
        {
            title: 'Received Status',
            dataIndex: 'received_status',
            key: 'received_status',
        },
        {
            title: 'Received Quantity',
            key: 'received_quantity',
            dataIndex: 'received_quantity',
            render: (text) => <>{text ? text : '-'}</>,
        },
        {
            title: 'New Order Quantity',
            key: 'new_order_quantity',
            // dataIndex: 'new_order_quantity',
            render: (_, value) => <>{value.received_status == "received_short" ? order.new_order_quantity : '-'}</>,
        },
    ];

    const collapseItems = [{
        key: '1',
        label: `Shipment Details`,
        children: (
            // <div className='row'>
            //     <div className="col">
            //         <p><strong>Types of Goods:</strong> {item.type_of_goods}</p>
            //         <p><strong>Quantity:</strong> {item.quantity}</p>
            //         <p><strong>UOM:</strong> {item.UOM}</p>
            //         <p><strong>Shipment Date:</strong> {formattedDateTime(item.shipment_date)}</p>
            //         <p><strong>Received Status:</strong> {item.received_status}</p>
            //         <p><strong>Received Quantity:</strong> {item.received_quantity}</p>
            //         {item.invoice && (
            //             <p><strong>Invoice Report:</strong> <Link to={item.invoice} target={'_blank'}>View Invoice</Link></p>
            //         )}
            //         {item.image && (
            //             <p><strong>Image:</strong> <Link to={item.image} target={'_blank'}>View Image</Link></p>
            //         )}
            //     </div>
            // </div>
            <>
                <Table columns={columns} dataSource={shipmentData} pagination={false} />
            </>
        ),
    }];

    return (
        <>
            <hr />
            <h6>Lists of shipment details:</h6>
            {shipmentData && shipmentData.length > 0 ?
                <>
                    <Collapse items={collapseItems} />
                </>
                : <h6 className='text-center'>Shipment details not updated</h6>
            }
        </>
    )
}

export default ShipmentDetails