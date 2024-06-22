import React, { useState } from 'react';
import { Button, DatePicker, Descriptions, Drawer, Form, Input, message, Modal, Popover, Select, Space, Spin, Table, Tag, Tooltip, Typography, Upload } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from "../../api/axios";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  CloseOutlined,
  PaperClipOutlined,
  UploadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatUpperCase } from '../../utils/utils';
import dayjs from 'dayjs';
import { typesOfGoods, uomChoices } from './OrderUtils';
import { CREATE_SHIPMENT_URL, FILE_UPLOAD_URL, GET_ALL_ORDERS_URL } from '../../api/apiUrls';
const { TextArea } = Input;

function Orders() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passData, setPassData] = useState(null);
  const { authUser } = useAuth();

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
    const response = await axios.get(GET_ALL_ORDERS_URL);
    return response.data.results;
  };

  const { isPending, error, data, refetch } = useQuery({
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
      render: (text) => <Button type='link'>{formatUpperCase(text)}</Button>,
    },
    {
      title: 'Planned Hours',
      dataIndex: 'planned_hours',
      key: 'planned_hours',
    },
    // {
    //   title: 'Actual Hours',
    //   dataIndex: 'actual_hours',
    //   key: 'actual_hours',
    // },
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
          color = "pink";
          icon = <CloseCircleOutlined />
        }
        return (
          <>
            <Tag color={color} icon={icon} key={goods_status}>
              <b>{goods_status ? formatUpperCase(goods_status) : formatUpperCase('Processing...')}</b>
            </Tag>
          </>
        )
      },
    },
    {
      title: 'Booking Status',
      key: 'renter_company_id',
      dataIndex: 'renter_company_id',
      render: (_, { renter_company_id }) => {
        return (
          <>
            <Tag color={'blue'} key={renter_company_id}>
              <b>{authUser.CompanyId == renter_company_id ? formatUpperCase('Order to be processed by me') : formatUpperCase('Order given by me')}</b>
            </Tag>
          </>
        )
      },
    },
    // when renter checks
    {
      title: 'Received Shipment',
      key: 'renter_company_id',
      dataIndex: 'renter_company_id',
      render: (_, record) => (
        <Typography.Link style={{ color: 'green' }}>{authUser.CompanyId == record.renter_company_id ? 'Yes' : '-'}</Typography.Link>
      ),
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
    refetch();
  }



  return (
    <>
      <div className="container-fluid">
        <div className='row'>
          <h5 class="card-title">My Orders</h5>
          <div className="col text-end">
            <Button type='link' onClick={refreshData} icon={<ReloadOutlined />}>Refresh Orders</Button>
          </div>
          <div className="col-auto">
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
  // console.log("items authUser", authUser);
  const [fileIsLoading, setFileIsLoading] = useState(false);
  // const [items, setItems] = useState(items);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState();
  const [form] = Form.useForm();
  const [shipmentDateTime, setShipmentDateTime] = useState('');
  const [fileUrls, setFileUrls] = useState({});
  // Note: fileUrls will be [url1, url2 ....]
  // edit the materials
  const [editOpen, setEditOpen] = useState(false);

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
    color = "pink";
    icon = <CloseCircleOutlined />
  }

  const showLargeDrawer = () => {
    setSize('large');
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
    setEditOpen(false);
  };

  const editMaterialDrawer = () => {
    setSize('large');
    setEditOpen(true);
  }

  const quoteItems = [
    {
      label: 'Order ID',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.order_id,
    },
    {
      label: 'Order Status',
      span: {
        xl: 2,
        xxl: 2,
      },
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
      span: {
        xl: 2,
        xxl: 2,
      },
      children: (
        <>
          <Tag color={color} icon={icon} key={items.goods_status}>
            <b>{items.goods_status ? formatUpperCase(items.goods_status) : formatUpperCase('Processing...')}</b>
          </Tag>
        </>
      )
    },

    {
      label: 'Booking Status',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: (
        <>
          <Tag color={'blue'}>
            <b>{authUser.CompanyId == items.renter_company_id ? formatUpperCase('Order to be processed by me') : formatUpperCase('Order given by me')}</b>
          </Tag>
        </>
      )
    },

    {
      label: 'Order Quantity',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: items.quantity,
    },
    {
      label: 'Booking ID',
      span: {
        xl: 2,
        xxl: 2,
      },
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
    authUser.CompanyId == items.hirer_company_id &&
    {
      label: 'Shipment Action',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: (
        <>
          <div className="row">
            <div className="col">
              <Popover content={items.goods_status == 'goods_in_transit' ? 'Please wait for renter response' : ''} trigger="hover">
                <Button type="primary" onClick={showLargeDrawer} disabled={items.goods_status == 'goods_in_transit' ? true : false}>
                  Add My Materials
                </Button>
              </Popover>
            </div>
          </div>
        </>
      )
    },
    // when renter checks
    authUser.CompanyId == items.renter_company_id &&
    {
      label: 'Shipment Action',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: (
        <>
          <div className="row">
            <div className="col">
              <Button type="primary" onClick={editMaterialDrawer}>
                Edit Materials
              </Button>
            </div>
          </div>
        </>
      )
    }


  ];

  const onOk = (value) => {
    console.log('onOk: ', value);
  };

  const uploadFileToServer = async (file, name) => {
    const formData = new FormData();
    formData.append('fileName', file);
    try {
      const response = await axios.post(FILE_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // console.log("response. file backblazedata: ", response.data);
      setFileUrls((prev) => ({
        ...prev,
        [name]: response.data.fileUrl,
      }));

      return response.data.fileUrl;
    } catch (error) {
      console.error("Error uploading file: ", error);
      message.error('File upload failed');
      return null;
    }
  };

  const onFinish = async (values) => {
    values.orderid = items.order_id;
    values.shipment_datetime = shipmentDateTime;
    values.goods_status = "goods_in_transit";
    // console.log('Success:', values);
    try {
      const updatedShipmentDetails = await Promise.all(
        values.shipment_details.map(async (detail, index) => {
          if (fileUrls[index]) {
            return { ...detail, invoice: fileUrls[index] };
          }
        })
      );
      const finalValues = { ...values, shipment_details: updatedShipmentDetails };
      // console.log('Success:', finalValues);
      const shipmentRes = await axios.post(CREATE_SHIPMENT_URL, (finalValues));
      // console.log("shipmentRes: ", shipmentRes);
      message.success(shipmentRes.data.message);
      setOpen(false); // drawer close
    } catch (error) {
      console.error('Shipment error:', error);
      message.error('Shipment failed. Please try again.');
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    errorInfo.errorFields.forEach(fieldError => {
      message.error(fieldError.errors[0]);
    });
  };

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().endOf('day');
  };

  const handleInvoiceChange = async (info, name) => {
    console.log("handleInvoiceChange: ", info);
    try {
      setFileIsLoading(true);
      const fileUrl = await uploadFileToServer(info.fileList[0].originFileObj);
      const isPdf = info.fileList[0].type === 'application/pdf';
      const isLt2M = info.fileList[0].size / 1024 / 1024 < 2;

      if (!isPdf) {
        // Show error message for non-PDF files
        message.warning('You can only upload PDF file!');
        console.warn('You can only upload PDF file!');
        setFileIsLoading(false);
      } else if (!isLt2M) {
        // Show error message for files larger than 2MB
        message.warning('File must be smaller than 2MB!');
        console.warn('File must be smaller than 2MB!');
        setFileIsLoading(false);
      } else {
        setFileUrls((prev) => ({
          ...prev,
          [name]: fileUrl,
        }));
        setFileIsLoading(false);
      }

    } catch (error) {
      console.error('File upload error:', error);
      message.error('File upload failed. Please try again.');
      setFileIsLoading(false);
    }
  };

  const handleFileRemove = (name) => {
    setFileUrls((prev) => {
      const updatedUrls = { ...prev };
      delete updatedUrls[name];
      return updatedUrls;
    });
  };


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

      <Drawer
        title={` ${editOpen ? 'Edit Shipment' : ''} Shipment Details Update Sheet - ${authUser.CompanyId == items.hirer_company_id ? '(Hirer)' : '(Renter)'} - Order ID: ${items.order_id}`}
        placement="top"
        size={size}
        onClose={onClose}
        open={editOpen ? editOpen : open}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            {/* <Button type="primary" onClick={onClose}>
              Add
            </Button> */}
          </Space>
        }
      >
        <Form
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout='vertical'
          form={form}
        >
          <div className='row'>
            <div className="col">
              <Form.Item
                label="Shipment Date Time"
                name="shipment_datetime"
                rules={[
                  {
                    required: true,
                    message: 'Please input your shipment date & time!',
                  },
                ]}
              >
                <DatePicker
                  disabledDate={disabledDate}
                  showTime
                  onChange={(value, dateString) => {
                    console.log('Selected Time: ', value);
                    console.log('Formatted Selected Time: ', dateString);
                    setShipmentDateTime(dateString);
                  }}
                  onOk={onOk}
                  placeholder="Select shipment date"
                  required
                />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <Form.List name="shipment_details">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => {
                      console.log("key: ", key);
                      console.log("name: ", name);
                      return (
                        <>
                          <h6>Shipment Details - {name + 1}</h6>
                          <div className='row' key={name}>
                            <div className="col">
                              <Form.Item
                                label="Type of Goods"
                                // name="typeofgoods"
                                {...restField}
                                name={[name, 'typeofgoods']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please input your type of goods!',
                                  },
                                ]}
                              >
                                <Select placeholder='Choose type of goods' style={{ width: '100%' }} options={typesOfGoods} />
                              </Form.Item>
                            </div>

                            <div className="col">
                              <Form.Item
                                label="Description"
                                // name="description"
                                {...restField}
                                name={[name, 'description']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please input your description!',
                                  },
                                ]}
                              >
                                {/* <Input /> */}
                                <TextArea rows={3} placeholder="Enter your description (max: 200 words)" maxLength={200} showCount required />
                              </Form.Item>
                            </div>

                            <div className="col">
                              <Form.Item
                                label="Shipment Qty"
                                // name="quantity"
                                {...restField}
                                name={[name, 'quantity']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please input your shipment quantity!',
                                  },
                                ]}
                              >
                                <Input placeholder='Enter shipment quantity' required />
                              </Form.Item>
                            </div>

                            <div className="col">
                              <Form.Item
                                label="UOM"
                                // name="uom"
                                {...restField}
                                name={[name, 'uom']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please input your UOM!',
                                  },
                                ]}
                              >
                                <Select placeholder='Choose UOM' style={{ width: '100%' }} options={uomChoices} />
                              </Form.Item>
                            </div>

                            {!fileUrls[name] && <div className="col-auto mt-4">
                              <Form.Item
                                // name="uom"
                                {...restField}
                                name={[name, 'invoice']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please upload your invoice!',
                                  },
                                ]}
                              >
                                <Upload
                                  valuePropName="file"
                                  getValueFromEvent={(e) => {
                                    if (Array.isArray(e)) {
                                      return e;
                                    }
                                    return e && e.file;
                                  }}
                                  onChange={(info) => handleInvoiceChange(info, name)}
                                  beforeUpload={() => false}
                                  accept=".pdf"
                                  maxCount={1}
                                  showUploadList={false}
                                >
                                  {fileIsLoading ? <>
                                    <Spin indicator={<LoadingOutlined spin />} />
                                  </> : <Button type={'primary'} icon={<PlusCircleOutlined />}>{fileIsLoading ? 'Uploading...' : 'Attach Invoice'} </Button>}
                                  <p>Max: 2 MB (Only PDF Format)</p>
                                </Upload>
                              </Form.Item>

                            </div>}

                            {fileUrls[name] && (
                              <div className='col-auto mt-4'>
                                <div>
                                  <a href={fileUrls[name]} target="_blank" rel="noopener noreferrer">View {'Shipment ' + (name + 1)} Invoice</a>
                                  <Button
                                    type="link"
                                    danger
                                    onClick={() => handleFileRemove(name)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>

                            )}

                            <div className='col-auto mt-4'>
                              <Tooltip title={`Remove Shipment - ${name + 1}`}>
                                <Button danger shape="circle" onClick={() => remove(name)} icon={<CloseOutlined />} />
                              </Tooltip>
                            </div>
                          </div>
                        </>
                      )
                    }

                    )}
                    {/* maximum four fields can be use so total 5 details */}
                    {fields.length < 5 && (
                      <div className='row'>
                        <div className="col-auto">
                          <Form.Item>
                            <Button type="primary" onClick={() => add()} block icon={<PlusOutlined />}>
                              Add more shipment details (Upto 5)
                            </Button>
                            {/* <button className='btn btn-secondary'>+ Add more shipment details</button> */}
                          </Form.Item>
                        </div>
                      </div>

                    )}
                  </>
                )}
              </Form.List>
              {/* <Button type='secondary' icon={<PlusOutlined />}>Add More Shipment Details</Button> */}
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col text-center">
              <Button htmlType='submit' type='primary'>Submit</Button>
            </div>
          </div>
        </Form>
      </Drawer>

    </>
  )
}

export default Orders;