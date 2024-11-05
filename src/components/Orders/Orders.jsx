import { Button, Collapse, message, Table, Tabs } from 'antd';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { GET_ALL_ORDERS_URL } from '../../api/apiUrls';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ReloadOutlined } from "@ant-design/icons";

function Orders() {

  const { authUser } = useAuth();
  const navigate = useNavigate();

  const [allOrders, setAllOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // console.log("authUser: ", authUser);

  const currentUserCompanyId = authUser && authUser.CompanyId;

  const getAllOrders = async () => {
    try {
      setOrderLoading(true);
      const response = await axios.get(GET_ALL_ORDERS_URL);
      // const filteredData = response.data.results.filter((item) => item.renter_company_id == authUser.CompanyId);
      setAllOrders(response.data.results);
      setOrderLoading(false);
      return response.data.results;
    } catch (error) {
      setAllOrders([]);
      setOrderLoading(false);
      message.error("Error on loading orders..");
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  // Function to group orders by Category and Machine_Type
  const groupOrdersByCategoryAndType = (orders) => {
    const groupedOrders = {};
    orders.forEach((order) => {
      const key = `${order.Category}-${order.Machine_Type}`;
      if (!groupedOrders[key]) {
        groupedOrders[key] = [];
      }
      groupedOrders[key].push(order);
    });
    return groupedOrders;
  };

  // filtered by current user and company id // please check the db for reference
  const myOrders = allOrders.filter(order => order.renter_company_id !== currentUserCompanyId);
  const customerOrders = allOrders.filter(order => order.renter_company_id === currentUserCompanyId);


  const handleView = (record) => {
    navigate(`/order-details/${record.order_id}`, {
      state: {
        order: record,
      },
    });
  };

  // Define columns for the orders table
  const columns = [
    { title: 'ID', dataIndex: 'quote_id', key: 'quote_id' },
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

  // Pagination config for tables
  const paginationConfig = {
    pageSize: 10,
    showSizeChanger: false,
    pageSizeOptions: ['5', '10', '20'],
  };

  const OrdersAccordion = ({ orders }) => {
    const groupedOrders = groupOrdersByCategoryAndType(orders);

    return (
      <Collapse accordion>
        {Object.keys(groupedOrders).map((groupKey, index) => {
          const [category, type] = groupKey.split("-");
          return (
            <Collapse.Panel header={`${category} - ${type}`} key={`${groupKey}-${index}`}>
              <Table
                dataSource={groupedOrders[groupKey]}
                columns={columns}
                rowKey={(record) => `${record.order_id}-${groupKey}`}
                pagination={paginationConfig}
              />
            </Collapse.Panel>
          );
        })}
      </Collapse>
    );
  };

  const MyOrdersTabs = ({ myOrders, customerOrders }) => {
    return (
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="My Orders" key="1">
          <OrdersAccordion orders={myOrders} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Customer Orders" key="2">
          <OrdersAccordion orders={customerOrders} />
        </Tabs.TabPane>
      </Tabs>
    );
  };

  const refreshData = () => {
    getAllOrders();
  }


  return (
    <>
      <div className="container-fluid">
        <h5 class="card-title text-center">Orders</h5>
        <div className='row'>
          <div className="col text-end">
            <Button type='link' onClick={refreshData} icon={<ReloadOutlined />}>Refresh Orders</Button>
          </div>
        </div>
        {/* <Tabs
          defaultActiveKey="1"
          items={items}
        /> */}
        {orderLoading ? <p>Loading your orders</p> : <MyOrdersTabs myOrders={myOrders} customerOrders={customerOrders} />}
        {/* This Outlet will render the nested routes */}
        {/* <Outlet /> */}
      </div>
    </>
  )
}

export default Orders