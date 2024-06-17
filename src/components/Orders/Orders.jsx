import React, { useState } from 'react';
import { Button, Descriptions, message, Modal, Space, Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from "../../api/axios";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  SyncOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment/moment';
import { useAuth } from '../../contexts/AuthContext';

function Orders() {
  const getAllOrderssUrl = "/order/getAllOrders";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passData, setPassData] = useState(null);
  const showModal = (data) => {
    setIsModalOpen(true);
    setPassData(data);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const getAllOrders = async () => {
    const response = await axios.get(getAllOrderssUrl);
    return response.data.results;
  };

  const { isPending, error, data } = useQuery({
    queryKey: ['allOrders'], queryFn: getAllOrders
  })

  console.log("isPending: ", isPending);
  console.log("error: ", error);
  console.log("data: ", data);

  if (isPending) return 'Loading Your Orders...'

  if (error) return message.error('An error has occurred: ' + error.message);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Order Status',
      dataIndex: 'order_status',
      key: 'order_status',
    },
    {
      title: 'Planned Hours',
      dataIndex: 'planned_hours',
      key: 'planned_hours',
    },
    {
      title: 'Actual Hours',
      dataIndex: 'actual_hours',
      key: 'actual_hours',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Good Status',
      key: 'goods_status',
      dataIndex: 'goods_status',
      render: (_, { goods_status }) => {
        console.log("goods_status: ", goods_status);
        let color;
        let icon;
        if (goods_status === "production_in_progress") {
          color = "geekblue";
          icon = <SyncOutlined />
        } else if (goods_status === "production_complete") {
          color = "green";
          icon = <CheckCircleOutlined />
        } else {
          color = "red";
          icon = <CloseCircleOutlined />
        }
        return (
          <>
            <Tag color={color} icon={icon} key={goods_status}>
              <b>{goods_status ? goods_status.toUpperCase() : '-'}</b>
            </Tag>
          </>
        )
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type='primary' onClick={() => showModal(record)}>View</Button>
          <Button type='primary' danger>Cancel</Button>
        </Space>
      ),
    },
  ];

  const refreshData = () => {
    getAllOrders();
  }



  return (
    <>
      <div className="container-fluid">
        <div className='row'>
          <h5 class="card-title">My Orders</h5>
          <div className="col text-end">
            <Button type='link' onClick={refreshData} icon={<ReloadOutlined />}>Refresh Orders</Button>
          </div>
          <div className="col-md-12">
            <Table columns={columns} dataSource={data} />
            {
              isModalOpen && <ViewModal isModalOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} items={passData} />
            }
          </div>

        </div>


      </div>
    </>
  )
}

const ViewModal = ({ isModalOpen, handleOk, handleCancel, items }) => {
  console.log("items vie", items);

  const { authUser } = useAuth();
  console.log("items authUser", authUser);
  const formattedDateTime = (data) => {
    return moment(data).format('MMMM Do YYYY, h:mm a');
  }

  const [isLoading, setIsLoading] = useState(false);
  // const [items, setItems] = useState(items);

  const UPDATE_QUOTE_URL = "/booking/updatequote";

  let color;
  let icon;
  if (items.order_status === "pending") {
    color = "geekblue";
    icon = <SyncOutlined />
  } else if (items.order_status === "accepted") {
    color = "green";
    icon = <CheckCircleOutlined />
  } else {
    color = "red";
    icon = <CloseCircleOutlined />
  }

  const acceptOrder = async () => {
    try {
      setIsLoading(true);
      var reqItem = {
        quoteid: items.quote_id,
        plannedstartdatetime: items.planned_start_date_time,
        plannedenddatetime: items.planned_end_date_time,
        machineid: items.machine_id,
        orderprocesssheet: items.order_process_sheet,
        orderspec: items.order_spec,
        orderdrawing: items.order_drawing,
        orderprogramsheet: items.order_program_sheet,
        otherattachments: items.other_attachments,
        quotestatus: 'accepted',
        quantity: items.quantity
      }


      const response = await axios.patch(UPDATE_QUOTE_URL, reqItem);
      console.log("accepted: ", response);
      message.success("Quote Accepted!");
      // setItems(response.data);
      setIsLoading(false);
    } catch (error) {
      console.log("accepted error: ", error);
      message.error("Something error while accepting the quote!");
      setIsLoading(false);
    }
  }

  const quoteItems = [
    {
      label: 'Order ID',
      children: items.order_id,
    },
    {
      label: 'Order Status',
      children: (
        <>
          <Tag color={color} icon={icon} key={items.order_status}>
            <b>{items.order_status.toUpperCase()}</b>
          </Tag>
        </>
      )
    },
    {
      label: 'Goods Status',
      children: (
        <>
          <Tag color={color} icon={icon} key={items.goods_status}>
            <b>{items.goods_status.toUpperCase()}</b>
          </Tag>
        </>
      )
    },
    
    {
      label: 'Order Quantity',
      children: items.quantity,
    },
    {
      label: 'Booking ID',
      children: items.booking_id,
    },
    {
      label: 'Planned Hours',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.planned_hours,
    },
    {
      label: 'Actual Hours',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.actual_hours,
    },
    {
      label: 'Hirer Company ID',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.hirer_company_id,
    }, {
      label: 'Renter Company ID',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.renter_company_id,
    },
    {
      label: 'First Sample Counter',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.first_sample_counter,
    },
    {
      label: 'Order Rework Counter',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.order_rework_counter,
    },
    items.delay_reason &&
    {
      label: 'Delay Reason',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.delay_reason,
    },

    // authUser.CompanyId == items.renter_company_id && items.quote_status == "pending" &&
    // {
    //   label: 'Action',
    //   children: (
    //     <>
    //       <div className='row'>
    //         <div className="col">
    //           <Button type='primary' onClick={acceptOrder}>{isLoading ? 'Accepting your quote...' : 'Accept Order'}</Button>
    //         </div>
    //         <div className="col">
    //           <Button type="dashed">Change Booking Dates</Button>
    //         </div>
    //         <div className="col">
    //           <Button type="primary" danger>Reject Order</Button>
    //         </div>
    //       </div>
    //     </>
    //   )
    // },
    // items.quote_status == "accepted" &&
    // {
    //   label: 'Note:',
    //   span: {
    //     xl: 2,
    //     xxl: 2,
    //   },
    //   children: (
    //     <>
    //       <div className='row'>
    //         <div className="col">
    //           <p>You can check your bookings <Link to={'my-bookings'}>here</Link></p>
    //         </div>
    //       </div>
    //     </>
    //   )
    // }

  ];

  return (
    <>
      <Modal open={isModalOpen} width={1300}
        footer={[
          <Button type='primary' onClick={handleOk}>
            Okay
          </Button>
        ]} onCancel={handleCancel} style={{ width: '100%' }}>
        <Descriptions
          title='Quote Details'
          bordered
          column={{
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          items={quoteItems}
        />
      </Modal>
    </>
  )
}

export default Orders;