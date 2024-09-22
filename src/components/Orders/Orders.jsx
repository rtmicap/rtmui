import { Button, message, Table, Tabs } from 'antd';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_ALL_ORDERS_URL } from '../../api/apiUrls';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

function Orders() {

  const { authUser } = useAuth();
  const navigate = useNavigate();

  const [allOrders, setAllOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // console.log("authUser: ", authUser);

  const currentUser = authUser.CompanyId;

  const getAllOrders = async () => {
    try {
      setOrderLoading(true);
      const response = await axios.get(GET_ALL_ORDERS_URL);
      // const filteredData = response.data.results.filter((item) => item.renter_company_id == authUser.CompanyId);
      console.log("all orders: ", response.data);
      setAllOrders(response.data.results);
      setOrderLoading(false);
      return response.data.results;
    } catch (error) {
      console.log("error orders: ", error);
      setAllOrders([]);
      setOrderLoading(false);
      message.error("Error on loading orders..");
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  // filtered by current user and company id // please check the db for reference
  const myOrders = allOrders.filter(order => order.renter_company_id === currentUser);
  const customerOrders = allOrders.filter(order => order.renter_company_id !== currentUser);

  const handleView = (record) => {
    navigate(`/order-details/${record.order_id}`,
      {
        state:
        {
          order: record
        }
      }
    );
  }

  // Define columns for the orders table
  const columns = [
    { title: 'Order ID', dataIndex: 'order_id', key: 'order_id' },
    { title: 'Status', dataIndex: 'order_status', key: 'order_status' },
    { title: 'Goods Status', dataIndex: 'goods_status', key: 'goods_status' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Planned Hours', dataIndex: 'planned_hours', key: 'planned_hours' },
    { title: 'Actual Hours', dataIndex: 'actual_hours', key: 'actual_hours' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button type="primary" onClick={() => handleView(record)}>View</Button>
          {/* <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>Delete</Button> */}
        </div>
      ),
    },
  ];

  // Define the tab items
  const items = [
    {
      key: '1',
      label: 'My Orders',
      children: (
        <Table
          dataSource={myOrders}
          columns={columns}
          rowKey="order_id"
          pagination={{ pageSize: 5 }}
        />
      ),
    },
    {
      key: '2',
      label: 'Customer Orders',
      children: (
        <Table
          dataSource={customerOrders}
          columns={columns}
          rowKey="order_id"
          pagination={{ pageSize: 5 }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="container-fluid">
        <h5 class="card-title text-center">My Orders</h5>
        <Tabs
          defaultActiveKey="1"
          items={items}
        />
      </div>
    </>
  )
}

export default Orders