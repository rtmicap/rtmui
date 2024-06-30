import React from 'react';
import { Tabs } from 'antd';
import OrdersContent from './Contents/OrdersContent';
import BookingsContent from './Contents/BookingsContent';
import ShipmentsContent from './Contents/ShipmentsContent';

const onChange = (key) => {
    console.log("tabs", key);
};
const items = [
    {
        key: '1',
        label: 'Orders',
        children: <OrdersContent />,
    },
    {
        key: '2',
        label: 'Bookings',
        children: <BookingsContent />,
    },
    {
        key: '3',
        label: 'Add/Update/Review Shipments',
        children: <ShipmentsContent />,
    },
];

const ReviewBooking = () => <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;

export default ReviewBooking;