import { Collapse } from 'antd';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { GET_SHIPMENT_BY_ORDERID_URL } from '../../../api/apiUrls';
import axios from '../../../api/axios';
import { formattedDateTime } from '../../../utils/utils';

function ShipmentDetails({ order_id }) {
    // shipment data
    const [shipmentData, setShipmentData] = useState([]);

    const getShipmentByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${order_id}`);
            console.log("getShipmentByOrderId: ", response.data);
            setShipmentData(response.data.result);
        } catch (error) {
            message.error("Something error while fetching shipment data!");
            console.log("shipment data err: ", error);
            setShipmentData([]);
        }
    }

    useEffect(() => {
        getShipmentByOrderId();
    }, []);

    const collapseItems = shipmentData.map((item, index) => ({
        key: item.id,
        label: `Shipment ID: ${item.shipment_id}`,
        children: (
            <div className='row'>
                <div className="col">
                    <p><strong>Types of Goods:</strong> {item.type_of_goods}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>UOM:</strong> {item.UOM}</p>
                    <p><strong>Shipment Date:</strong> {formattedDateTime(item.shipment_date)}</p>
                    {item.image && (
                        <p><strong>Invoice Report:</strong> <Link to={item.invoice} target={'_blank'}>View Invoice</Link></p>
                    )}
                    {item.image && (
                        <p><strong>Image:</strong> <Link to={item.image} target={'_blank'}>View Image</Link></p>
                    )}
                </div>
            </div>
        ),
    }));

    return (
        <>
            <hr />
            {shipmentData && shipmentData.length > 0 &&
                <>
                    <h6>Lists of shipment details:</h6>
                    <Collapse items={collapseItems} />
                </>
            }
        </>
    )
}

export default ShipmentDetails