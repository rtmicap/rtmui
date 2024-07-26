import React, { useState, useEffect } from 'react';
import { Button, DatePicker, Descriptions, Drawer, Flex, Form, Input, message, Modal, Popover, Select, Space, Spin, Table, Tag, Tooltip, Typography, Upload } from 'antd';
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
import { formattedDateTime, formatUpperCase } from '../../utils/utils';
import dayjs from 'dayjs';
import { receiptConfirmation, sampleDisposition, typesOfGoods, uomChoices } from './OrderUtils';
import { CREATE_FINAL_REPORT_URL, CREATE_FIRST_SAMPLE_REPORT_URL, CREATE_SHIPMENT_URL, FILE_UPLOAD_URL, GET_ALL_ORDERS_URL, GET_FIRST_SAMPLE_REPORT_ORDERID_URL, GET_SHIPMENT_BY_ORDERID_URL, UPDATE_FINAL_REPORT_URL, UPDATE_FIRST_SAMPLE_REPORT_URL, UPDATE_SHIPMENT_URL } from '../../api/apiUrls';
import moment from 'moment/moment';
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
    // const filteredData = response.data.results.filter((item) => item.renter_company_id == authUser.CompanyId);
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
    // {
    //   title: 'Received Shipment',
    //   key: 'renter_company_id',
    //   dataIndex: 'renter_company_id',
    //   render: (_, record) => (
    //     <Typography.Link style={{ color: 'green' }}>{authUser.CompanyId == record.renter_company_id ? 'Yes' : '-'}</Typography.Link>
    //   ),
    // },
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
      <div className="container">
        <div className='row'>
          <h5 class="card-title">My Orders</h5>
          <div className="col text-end">
            <Button type='link' onClick={refreshData} icon={<ReloadOutlined />}>Refresh Orders</Button>
          </div>
          <div className="col-auto">
            <Table columns={columns} dataSource={data} />
            {
              isModalOpen && <ViewModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} handleOk={handleOk} handleCancel={handleCancel} items={passData} />
            }
          </div>

        </div>
      </div>
    </>
  )
}


const ViewModal = ({ isModalOpen, setIsModalOpen, handleOk, handleCancel, items }) => {
  console.log("items vie", items);
  const { authUser } = useAuth();
  // console.log("items authUser", authUser);
  const [imageFileIsLoading, setImageFileIsLoading] = useState(false);
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
  const [selectedItems, setSelectedItems] = useState([]);
  // shipment data
  const [shipmentData, setShipmentData] = useState({});
  // inspection report
  const [openSampleReport, setOpenSampleReport] = useState(false);
  const [inspectionDateTime, setInspectionDateTime] = useState('');
  const [inspectionReportFileList, setInspectionReportFileList] = useState([]);
  const [fileReportLoading, setFileReportLoading] = useState(false);
  const [viewInspectionReportFile, setViewInspectionReportFile] = useState('');
  const [reviewSampleReport, setReviewSampleReport] = useState(false);
  // final report
  const [openFinalReport, setOpenFinalReport] = useState(false);
  const [orderCompletionDateTime, setOrderCompletionDateTime] = useState('');
  const [reviewFinalReportForHirer, setReviewFinalReportForHirer] = useState(false);
  const [goodsPickUpDateTime, setGoodsPickUpDateTime] = useState('');
  const [prodInspectionReportFileList, setProdInspectionReportFileList] = useState([]);
  const [viewProdLotInspectionReportFile, setViewProdLotInspectionReportFile] = useState('');
  const [fileFinalReportLoading, setFileFinalReportLoading] = useState(false);

  const getShipmentByOrderId = async () => {
    const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${items.order_id}`);
    console.log("getShipmentByOrderId: ", response);
    setShipmentData(response.data.result);
  }

  const fetchShipmentDetails = async (orderId) => {
    const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${items.order_id}`);
    console.log("fetchShipmentDetails: ", response);
    if (response.data.message === "Successfully fetched shipment details for order id provided") {
      const formattedDetails = response.data.result.map(detail => ({
        ...detail,
        typeofgoods: detail.type_of_goods,
      }));
      form.setFieldsValue({ shipment_details: formattedDetails });
      form.setFieldsValue({ shipment_datetime: moment(formattedDetails[0].shipment_date) })
      console.log("formattedDetails: ", formattedDetails);
    }
  };

  useEffect(() => {
    getShipmentByOrderId();
    const orderId = items.order_id; // Replace with your dynamic order ID
    fetchShipmentDetails(orderId);
  }, [])

  console.log("shipmentData: ", shipmentData);

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
    console.log("");
  }

  const reviewInspectionReport = async () => {
    setReviewSampleReport(true);
    setOpenSampleReport(true);
    const response = await axios.get(`${GET_FIRST_SAMPLE_REPORT_ORDERID_URL}/${items.order_id}`)
    console.log("reviewInspectionReport: ", response.data);
    const values = response.data.results[0];
    const inspectionDateTime = moment(values.inspection_date_time);
    form.setFieldsValue({
      inspection_date_time: inspectionDateTime, // assuming you are using moment.js for date handling
      part_number: values.part_number,
      part_name: values.part_name,
      uom: values.UOM,
      first_sample_quantity: values.first_sample_quantity,
      first_sample_inspection_report: values.first_sample_inspection_report,
      first_sample_disposition: values.first_sample_disposition,
      first_sample_id: values.id
    });
  }

  const showInspectionReport = () => {
    setOpenSampleReport(true);
  }

  const onCloseSampleReport = () => {
    setOpenSampleReport(false);
  };


  const showFinalReport = async () => {
    setOpenFinalReport(true);
    const response = await axios.get(`${GET_FIRST_SAMPLE_REPORT_ORDERID_URL}/${items.order_id}`)
    console.log("reviewInspectionReport: ", response.data);
    const values = response.data.results[0];
    form.setFieldsValue({
      part_number: values.part_number,
      part_name: values.part_name,
      uom: values.UOM,
      first_sample_id: values.id,
    });
  }

  const onCloseFinalReport = () => {
    setOpenFinalReport(false);
  }

  const reviewFinalReport = async () => {
    setOpenFinalReport(true);
    setReviewFinalReportForHirer(true);
    // review related Data
    const response = await axios.get(`${GET_FIRST_SAMPLE_REPORT_ORDERID_URL}/${items.order_id}`)
    console.log("reviewInspectionReport: ", response.data);
    const values = response.data.results[0];
    const inspectionDateTime = moment(values.inspection_date_time);
    const completionDateTime = moment(values.completion_date_time);
    form.setFieldsValue({
      inspection_date_time: inspectionDateTime, // assuming you are using moment.js for date handling
      completion_date_time: completionDateTime,
      part_number: values.part_number,
      part_name: values.part_name,
      uom: values.UOM,
      first_sample_quantity: values.first_sample_quantity,
      first_sample_inspection_report: values.first_sample_inspection_report,
      first_sample_disposition: values.first_sample_disposition,
      first_sample_id: values.id,
      order_ok_quantity: values.order_ok_quantity,
      final_product_disposition: values.final_product_disposition,
      prod_lot_inspection_report: values.prod_lot_inspection_report,
      order_completion_remarks: values.order_completion_remarks

    });
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
    // received shipment or not
    // {
    //   label: 'Received Shipment',
    //   span: {
    //     xl: 2,
    //     xxl: 2,
    //   },
    //   children: (
    //     <>
    //       {shipmentData.length > 0 ? "Yes" : "No"}
    //     </>
    //   ),
    // },
    // when hirer checks
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
                  Ship Materials To Renter
                </Button>
              </Popover>
            </div>
          </div>
        </>
      )
    },
    // when renter checks
    authUser.CompanyId == items.renter_company_id && shipmentData.length > 0 &&
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
                Review Received Materials
              </Button>
            </div>
          </div>
        </>
      )
    },

    // when renter checks sample report
    authUser.CompanyId == items.renter_company_id &&
    {
      label: 'First Sample Inspection Report',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: (
        <>
          <div className="row">
            <div className="col">
              <Button type="primary" onClick={showInspectionReport}>
                Create First Sample Report
              </Button>
            </div>
          </div>
        </>
      )
    },

    // when hirer checks sample report
    authUser.CompanyId == items.hirer_company_id &&
    {
      label: 'First Sample Inspection Report',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: (
        <>
          <div className="row">
            <div className="col">
              <Button type="primary" onClick={reviewInspectionReport}>
                Review First Sample Report
              </Button>
            </div>
          </div>
        </>
      )
    },

    // when renter checks final report
    authUser.CompanyId == items.renter_company_id &&
    {
      label: 'Final Report',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: (
        <>
          <div className="row">
            <div className="col">
              <Button type="primary" onClick={showFinalReport}>
                Create Final Report
              </Button>
            </div>
          </div>
        </>
      )
    },

    // when hirer checks final report
    authUser.CompanyId == items.hirer_company_id &&
    {
      label: 'Review Final Report',
      span: {
        xl: 2,
        xxl: 2,
      },
      children: (
        <>
          <div className="row">
            <div className="col">
              <Button type="primary" onClick={reviewFinalReport}>
                Review Final Report
              </Button>
            </div>
          </div>
        </>
      )
    },


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
          let updatedDetail = { ...detail };
          if (fileUrls[index]) {
            updatedDetail.image = fileUrls[index];
          }
          if (updatedDetail.typeofgoods === 'invoice') {
            updatedDetail = { typeofgoods: 'invoice', invoice: updatedDetail.image };
          }
          return updatedDetail;
        })
      );
      const finalValues = { ...values, shipment_details: updatedShipmentDetails };
      console.log('Success:', finalValues);
      const shipmentRes = await axios.post(CREATE_SHIPMENT_URL, finalValues);
      console.log("shipmentRes: ", shipmentRes);
      message.success(shipmentRes.data.message);
      setOpen(false); // drawer close
      setIsModalOpen(false) // view modal close
      resetForm(); // clear the form data

    } catch (error) {
      console.error('Shipment error:', error);
      message.error('Shipment failed. Please try again.');
      resetForm(); // clear the form data
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    errorInfo.errorFields.forEach(fieldError => {
      message.error(fieldError.errors[0]);
    });
  };

  const updateShipmentFn = async () => {
    try {
      const data = form.getFieldsValue();
      console.log("updateShipmentFn: ", data);
      data.orderid = items.order_id;
      const response = await axios.patch(UPDATE_SHIPMENT_URL, data);
      console.log("response update ship: ", response);
      message.success(response.data.message);
      setEditOpen(false);
    } catch (error) {
      message.error("There is some error while updating the shipment!");
      console.log("shipment update err: ", error);
    }

  }

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

  const handleImageChange = async (info, name) => {
    console.log("handleInvoiceChange: ", info);
    try {
      setImageFileIsLoading(true);
      const fileUrl = await uploadFileToServer(info.fileList[0].originFileObj);
      const isImageFormat = info.fileList[0].type === 'application/jpg' || 'application/jpeg' || 'application/png';
      const isLt2M = info.fileList[0].size / 1024 / 1024 < 2;

      if (!isImageFormat) {
        // Show error message for non-PDF files
        message.warning('You can only upload PDF file!');
        console.warn('You can only upload PDF file!');
        setImageFileIsLoading(false);
      } else if (!isLt2M) {
        // Show error message for files larger than 2MB
        message.warning('File must be smaller than 2MB!');
        console.warn('File must be smaller than 2MB!');
        setImageFileIsLoading(false);
      } else {
        setFileUrls((prev) => ({
          ...prev,
          [name]: fileUrl,
        }));
        setImageFileIsLoading(false);
      }

    } catch (error) {
      console.error('File upload error:', error);
      message.error('File upload failed. Please try again.');
      setImageFileIsLoading(false);
    }
  };

  const handleFileRemove = (name) => {
    setFileUrls((prev) => {
      const updatedUrls = { ...prev };
      delete updatedUrls[name];
      return updatedUrls;
    });
  };

  const handleSelectChange = (value, name) => {
    console.log("handleSelectChange name: ", name);
    console.log("handleSelectChange value: ", value);
    form.setFieldsValue({ [name]: value });
  };

  const resetForm = () => {
    form.resetFields();
  }

  // sample report related functions below

  const onFinishReport = async (values) => {
    values.orderid = items.order_id;
    values.inspection_date_time = inspectionDateTime;
    values.first_sample_inspection_report = viewInspectionReportFile;
    values.first_sample_disposition = "pending_approval";
    console.log('onFinishReport:', values);
    const response = await axios.post(CREATE_FIRST_SAMPLE_REPORT_URL, values);
    message.success(`${response.data.message}`);
    // close drawer
    setOpenSampleReport(false);
  }

  const onFinishFailedReport = (errorInfo) => {
    console.log('Failed:', errorInfo);
    errorInfo.errorFields.forEach(fieldError => {
      message.error(fieldError.errors[0]);
    });
    setLoading(false);
  };

  const fileUpload = async (file) => {
    try {
      const configHeaders = {
        headers: { "content-type": "multipart/form-data" },
      };
      const formData = new FormData();
      formData.append("fileName", file.originFileObj);
      var response = await axios.post(FILE_UPLOAD_URL, formData, configHeaders);
      return response.data;
    } catch (error) {
      return error;
    }
  }

  const handleInspectionReportFileChange = async (info) => {
    let fileList = [...info.fileList];
    // Limit to only one file
    fileList = fileList.slice(-1);
    // console.log("size: ", fileList[0].size / 1024 / 1024 < 2);
    // Display an error message if more than one file is uploaded
    if (fileList.length > 1) {
      message.error('You can only upload one file');
    } else {
      setInspectionReportFileList(fileList);
      if (fileList[0].size / 1024 / 1024 < 2) { // upto 2 MB upload size
        setFileReportLoading(true);
        // update file upload api
        const fileRes = await fileUpload(fileList[0]);
        // console.log("fileRes: ", fileRes);
        message.success("Inspection Report File Uploaded!")
        setViewInspectionReportFile(fileRes.fileUrl);
        setFileReportLoading(false);
      } else {
        message.error('File size must less than 2 MB');
      }
    }
  }

  const handleInspectionReportRemove = () => {
    setInspectionReportFileList([]);
    setViewInspectionReportFile('');
  };

  const sampleReportStatusUpdate = async (value) => {
    // const reqItem = {
    //   orderid: items.order_id,
    //   first_sample_disposition: value,
    //   first_sample_remarks: form.getFieldValue('first_sample_remarks')
    // }
    try {
      const data = form.getFieldsValue();
      data.first_sample_disposition = value;
      data.orderid = items.order_id;
      data.first_sample_id = form.getFieldValue("first_sample_id")
      console.log("datta: ", data);
      const response = await axios.patch(UPDATE_FIRST_SAMPLE_REPORT_URL, data);
      console.log("updated: ", response.data);
      message.success(response.data.message);
      setOpenSampleReport(false);
    } catch (error) {
      console.log("error update: ", error);
      message.error("There is some error!");
      setOpenSampleReport(false);
    }

  }

  // final report 

  const handleProdLotInspectionReportFileChange = async (info) => {
    let fileList = [...info.fileList];
    // Limit to only one file
    fileList = fileList.slice(-1);
    // console.log("size: ", fileList[0].size / 1024 / 1024 < 2);
    // Display an error message if more than one file is uploaded
    if (fileList.length > 1) {
      message.error('You can only upload one file');
    } else {
      setProdInspectionReportFileList(fileList);
      if (fileList[0].size / 1024 / 1024 < 2) { // upto 2 MB upload size
        setFileFinalReportLoading(true);
        // update file upload api
        const fileRes = await fileUpload(fileList[0]);
        // console.log("fileRes: ", fileRes);
        message.success("Final Inspection Report File Uploaded!")
        setViewProdLotInspectionReportFile(fileRes.fileUrl);
        setFileFinalReportLoading(false);
      } else {
        message.error('File size must less than 2 MB');
      }
    }
  }

  const handleProdLotInspectionReportRemove = () => {
    setProdInspectionReportFileList([]);
    setViewProdLotInspectionReportFile('');
  };

  const onFinishFinalReport = async (values) => {
    const data = form.getFieldsValue();
    console.log("get Data: ", data);
    values.orderid = items.order_id;
    values.final_goods_planned_pickup_datetime = goodsPickUpDateTime;
    values.completion_date_time = orderCompletionDateTime;
    values.prod_lot_inspection_report = viewProdLotInspectionReportFile;
    values.final_product_disposition = "approved";
    values.first_sample_id = form.getFieldValue("first_sample_id");
    console.log('onFinishFinalReport:', values);
    const response = await axios.post(CREATE_FINAL_REPORT_URL, values);
    message.success(`${response.data.message}`);
    // close drawer
    setOpenFinalReport(false);
  }

  const onFinishFailedFinalReport = (errorInfo) => {
    console.log('onFinishFailedFinalReport Failed:', errorInfo);
    errorInfo.errorFields.forEach(fieldError => {
      message.error(fieldError.errors[0]);
    });
    setLoading(false);
  };

  const submitFinalReportStatus = async (value) => {
    try {
      const data = form.getFieldsValue();
      data.final_product_disposition = value;
      data.orderid = items.order_id;
      data.first_sample_id = form.getFieldValue("first_sample_id")
      console.log("final report datta: ", data);
      // const response = await axios.patch(UPDATE_FINAL_REPORT_URL, data);
      // console.log("updated: ", response.data);
      // message.success(response.data.message);
      setOpenFinalReport(false);
    } catch (error) {
      console.log("error final report: ", error);
      message.error("There is some error in final report!");
      setOpenFinalReport(false);
    }
  }

  return (
    <>
      <Modal open={isModalOpen} width={1300}
        footer={[
          <Button type='primary' onClick={handleOk}>
            Okay
          </Button>
        ]} onCancel={handleCancel} style={{ width: '100%' }}>
        <Descriptions
          title='Order Details'
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
      {/* // create and review shipment materials */}
      <Drawer
        title={` ${editOpen ? 'Edit Shipment' : `Shipment Details Update Sheet -${authUser.CompanyId == items.hirer_company_id ? '(Hirer)' : '(Renter)'} - Order ID: ${items.order_id}`} `}
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
                {editOpen &&
                  <DatePicker
                    disabledDate={disabledDate}
                    showTime
                    name='shipment_date'
                    onChange={(value, dateString) => {
                      console.log('Selected Time: ', value);
                      console.log('Formatted Selected Time: ', dateString);
                      setShipmentDateTime(dateString);
                    }}
                    onOk={onOk}
                    placeholder="Select shipment date"
                    required
                  />
                }
                {/* 
                {editOpen && (
                  <>{formattedDateTime(form.getFieldValue('shipment_date'))}</>
                )} */}
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
                          {editOpen &&
                            <p><span style={{ fontWeight: 'bold' }}>Note:</span>&nbsp;<span style={{ color: "red" }}>You can't modify any of the below fields except receipt confirmation</span></p>
                          }
                          <div className='row' key={name}>
                            <div className="col">
                              <Form.Item
                                label="Type of Goods"
                                // name="typeofgoods"
                                {...restField}
                                name={[name, 'typeofgoods']}
                                value={selectedItems}
                                onChange={setSelectedItems}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please input your type of goods!',
                                  },
                                ]}
                              >
                                <Select readOnly={editOpen} placeholder='Choose type of goods' style={{ width: '100%' }} onChange={handleSelectChange} options={typesOfGoods} />
                              </Form.Item>
                            </div>

                            {form.getFieldValue(['shipment_details', name, 'typeofgoods']) !== 'invoice' && (
                              <>
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
                                    <TextArea rows={3} readOnly={editOpen} placeholder="Enter your description (max: 200 words)" maxLength={200} showCount required />
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
                                    <Input placeholder='Enter shipment quantity' readOnly={editOpen} required />
                                  </Form.Item>
                                </div>

                                <div className="col">
                                  <Form.Item
                                    label={"UOM"}
                                    // name="uom"
                                    {...restField}
                                    name={[name, 'UOM']}
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

                                {editOpen &&
                                  <div className="col">
                                    <Form.Item
                                      label="Receipt Confirmation"
                                      // name="uom"
                                      {...restField}
                                      name={[name, 'received_status']}
                                      rules={[
                                        {
                                          required: true,
                                          message: 'Please input receipt confirmation!',
                                        },
                                      ]}
                                    >
                                      <Select placeholder='Choose Receipt Confirmation' style={{ width: '100%' }} options={receiptConfirmation} />
                                    </Form.Item>
                                  </div>
                                }

                                {!fileUrls[name] && <div className="col-auto mt-4">
                                  <Form.Item
                                    // name="uom"
                                    {...restField}
                                    name={[name, 'image']}
                                  >
                                    <Upload
                                      valuePropName="file"
                                      getValueFromEvent={(e) => {
                                        if (Array.isArray(e)) {
                                          return e;
                                        }
                                        return e && e.file;
                                      }}
                                      onChange={(info) => handleImageChange(info, name)}
                                      beforeUpload={() => false}
                                      accept=".jpg,.jpeg,.png"
                                      maxCount={1}
                                      showUploadList={false}
                                    >
                                      {imageFileIsLoading ? <>
                                        <Spin indicator={<LoadingOutlined spin />} />
                                      </> : <Button type={'primary'} icon={<PlusCircleOutlined />}>{imageFileIsLoading ? 'Uploading...' : 'Attach Image'} </Button>}
                                      <p>Max: 2 MB (Only PDF Format)</p>
                                    </Upload>
                                  </Form.Item>

                                </div>
                                }
                              </>
                            )}

                            {form.getFieldValue(['shipment_details', name, 'typeofgoods']) === 'invoice' && (
                              <>
                                {!fileUrls[name] && <div className="col-auto mt-4">
                                  <Form.Item
                                    // name="uom"
                                    {...restField}
                                    name={[name, 'invoice']}
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
                                      </> : <Button type={'primary'} icon={<PlusCircleOutlined />}>{fileIsLoading ? 'Uploading...' : 'Attach invoice'} </Button>}
                                      <p>Max: 2 MB (Only PDF Format)</p>
                                    </Upload>
                                  </Form.Item>

                                </div>
                                }
                              </>
                            )}



                            {fileUrls[name] && (
                              <div className='col-auto mt-4'>
                                <div>
                                  <a href={fileUrls[name]} target="_blank" rel="noopener noreferrer">View File</a>
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
                              <Tooltip title={`Remove Shipment - ${name + 1} `}>
                                <Button danger shape="circle" onClick={() => remove(name)} icon={<CloseOutlined />} />
                              </Tooltip>
                            </div>
                          </div>
                        </>
                      )
                    }

                    )}
                    {/* maximum four fields can be use so total 5 details */}
                    {fields.length < 5 && !editOpen && (
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
            {!editOpen &&
              <div className="col text-center">
                <Button htmlType='submit' type='primary'>Submit</Button>
              </div>
            }
            {editOpen &&
              <div className="col text-center">
                <Button htmlType='button' type='primary' onClick={updateShipmentFn}>Update Shipment</Button>
              </div>
            }
          </div>
        </Form>
      </Drawer>

      {/* // create and review sample Report */}
      <Drawer title={`First Sample Inspection Report to ${reviewSampleReport ? 'Renter' : 'Hirer'}`} onClose={onCloseSampleReport} open={openSampleReport} size='large'>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishReport}
          onFinishFailed={onFinishFailedReport}
        >
          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <Form.Item
                  label="Order ID"
                  name={'orderid'}
                >
                  <Tooltip title={`Order ID is ${items.order_id}. You can't modify.`}>
                    <Input placeholder="input placeholder" defaultValue={items.order_id} style={{ width: '100%' }} readOnly />
                  </Tooltip>
                </Form.Item>
              </div>

              <div className="col">
                <Form.Item label="Inspection Date/Time" name={'inspection_date_time'} required tooltip={{
                  title: 'This is a required field',
                  // icon: <InfoCircleOutlined />,
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please choose inspection start date/time',
                    },
                  ]}
                >
                  {!reviewSampleReport && <DatePicker
                    disabledDate={disabledDate}
                    showTime
                    onChange={(value, dateString) => {
                      console.log('Selected Time: ', value);
                      console.log('Formatted Selected Time: ', dateString);
                      setInspectionDateTime(dateString);
                    }}
                    onOk={onOk}
                  />}

                  {reviewSampleReport && (
                    <>{formattedDateTime(form.getFieldValue('inspection_date_time'))}</>
                  )}
                </Form.Item>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <Form.Item label="Part Name" required name={'part_name'} tooltip={{
                  title: 'This is a required field'
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please update the part name!',
                    },
                  ]}
                >
                  <Input placeholder="input placeholder" style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <div className="col">
                <Form.Item label="Part Number" required name={'part_number'} tooltip={{
                  title: 'This is a required field'
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please update the part number!',
                    },
                  ]}
                >
                  <Input placeholder="input placeholder" style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <Form.Item label="Sample Quantity" required name={'first_sample_quantity'} tooltip={{
                  title: 'This is a required field'
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please update the sample quantity!',
                    },
                    {
                      pattern: /^[1-9]$/,
                      message: 'Sample quantity must be between 1 and 9!',
                    },
                  ]}
                >
                  <Input placeholder="input placeholder" style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <div className="col">
                <Form.Item
                  label="UOM"
                  name="uom"
                  required
                  rules={[
                    {
                      required: true,
                      message: 'Please update your UOM!',
                    },
                  ]}
                >
                  <Select placeholder='Choose UOM' style={{ width: '100%' }} options={uomChoices} />
                </Form.Item>
              </div>
            </div>

            <div className="row">
              {authUser.CompanyId == items.hirer_company_id &&
                <div className="col">
                  <Form.Item
                    label="Sample Disposition"
                    name="first_sample_disposition"
                    required
                    rules={[
                      {
                        required: true,
                        message: 'Please update your sample disposition!',
                      },
                    ]}
                  >
                    <Select placeholder='Choose sample disposition' style={{ width: '100%' }} options={sampleDisposition} />
                  </Form.Item>
                </div>
              }

              <div className="col">
                <Form.Item label="Attach Inspection Report" required name={'first_sample_inspection_report'} tooltip={{
                  title: 'This is a required field'
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please attach the inspection report!',
                    },
                  ]}
                >
                  <Flex gap="small" wrap>
                    <Upload
                      fileList={inspectionReportFileList}
                      onChange={handleInspectionReportFileChange}
                      maxCount={1}
                      beforeUpload={() => false}
                      onRemove={handleInspectionReportRemove}
                    >
                      <Button loading={fileReportLoading} icon={<UploadOutlined />}>{fileReportLoading ? 'Uploading..' : 'Attach Report'}</Button>
                    </Upload>
                    {viewInspectionReportFile &&
                      <Link to={viewInspectionReportFile} target={'_blank'}>View File</Link>
                    }

                    {reviewSampleReport && form.getFieldValue('first_sample_inspection_report') &&
                      <Link to={form.getFieldValue('first_sample_inspection_report')} target={'_blank'}>View report file</Link>
                    }
                  </Flex>
                </Form.Item>
              </div>

            </div>

            {reviewSampleReport &&
              <>
                <div className="row">
                  <div className="col">
                    <Form.Item
                      label="Remarks (300 words)"
                      name="first_sample_remarks"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Please input your remarks!',
                        },
                      ]}
                    >
                      <TextArea rows={3} placeholder="Enter your remarks (max: 300 words)" maxLength={300} showCount required />
                    </Form.Item>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <Button type='primary' onClick={() => sampleReportStatusUpdate("approved")}>Approved & Proceed for Production</Button>
                  </div>
                  <div className="col">
                    <Button onClick={() => sampleReportStatusUpdate("repeat_sample")}>Do Resample</Button>
                  </div>
                  <div className="col">
                    <Button type='primary' danger onClick={() => sampleReportStatusUpdate("rejected")}>Reject & Cancel Order</Button>
                  </div>
                </div>
                <hr />
              </>
            }

            <div className="row">
              <div className="col">
                <Button type='primary' htmlType="submit">Share FSIR to {reviewSampleReport ? 'Renter' : 'Hirer'}</Button>
              </div>
            </div>
          </div>
        </Form>

      </Drawer>
      {/* // end of create and review sample Report */}

      {/* // create and review Final Report */}
      <Drawer title={`Final Order Report`} onClose={onCloseFinalReport} open={openFinalReport} size='large'>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishFinalReport}
          onFinishFailed={onFinishFailedFinalReport}
        >
          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <Form.Item
                  label="Order ID"
                  name={'orderid'}
                >
                  <Tooltip title={`Order ID is ${items.order_id}. You can't modify.`}>
                    <Input placeholder="input placeholder" defaultValue={items.order_id} style={{ width: '100%' }} readOnly />
                  </Tooltip>
                </Form.Item>
              </div>

              <div className="col">
                <Form.Item label="Completion Date/Time" name={'completion_date_time'} required tooltip={{
                  title: 'This is a required field',
                  // icon: <InfoCircleOutlined />,
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please choose completion date/time',
                    },
                  ]}
                >
                  {!reviewFinalReportForHirer && <DatePicker
                    disabledDate={disabledDate}
                    showTime
                    onChange={(value, dateString) => {
                      console.log('Selected Time: ', value);
                      console.log('Formatted Selected Time: ', dateString);
                      setOrderCompletionDateTime(dateString);
                    }}
                    onOk={onOk}
                  />}

                  {reviewFinalReportForHirer && (
                    <>{form.getFieldValue('completion_date_time') ? formattedDateTime(form.getFieldValue('completion_date_time')) : "Date/Time are not updated"}</>
                  )}
                </Form.Item>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <Form.Item label="Part Name" required name={'part_name'} tooltip={{
                  title: 'This is a required field'
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please update the part name!',
                    },
                  ]}
                >
                  <Input placeholder="input placeholder" style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <div className="col">
                <Form.Item label="Part Number" name={'part_number'}
                  rules={[
                    {
                      message: 'Please update the part number!',
                    },
                  ]}
                >
                  <Input placeholder="input placeholder" style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <Form.Item label="Order OK Quantity" required name={'order_ok_quantity'} tooltip={{
                  title: 'This is a required field'
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please update the order OK quantity!',
                    },
                  ]}
                >
                  <Input placeholder="input placeholder" style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <div className="col">
                <Form.Item
                  label="UOM"
                  name="uom"
                  required
                  rules={[
                    {
                      required: true,
                      message: 'Please update your UOM!',
                    },
                  ]}
                >
                  <Select placeholder='Choose UOM' style={{ width: '100%' }} options={uomChoices} />
                </Form.Item>
              </div>
            </div>

            <div className="row">
              {authUser.CompanyId == items.hirer_company_id &&
                <div className="col">
                  <Form.Item
                    label="Final Disposition"
                    name="final_product_disposition"
                    required
                    rules={[
                      {
                        required: true,
                        message: 'Please update your final disposition!',
                      },
                    ]}
                  >
                    <Select placeholder='Choose final disposition' style={{ width: '100%' }} options={sampleDisposition} />
                  </Form.Item>
                </div>
              }

              <div className="col">
                <Form.Item label="Prod Lot Inspection Report" required name={'prod_lot_inspection_report'} tooltip={{
                  title: 'This is a required field'
                }}
                  rules={[
                    {
                      required: true,
                      message: 'Please attach the prod lot inspection report!',
                    },
                  ]}
                >
                  <Flex gap="small" wrap>
                    <Upload
                      fileList={prodInspectionReportFileList}
                      onChange={handleProdLotInspectionReportFileChange}
                      maxCount={1}
                      beforeUpload={() => false}
                      onRemove={handleProdLotInspectionReportRemove}
                    >
                      <Button loading={fileFinalReportLoading} icon={<UploadOutlined />}>{fileFinalReportLoading ? 'Uploading..' : 'Attach Final Report'}</Button>
                    </Upload>
                    {viewProdLotInspectionReportFile &&
                      <Link to={viewProdLotInspectionReportFile} target={'_blank'}>View File</Link>
                    }

                    {reviewFinalReportForHirer && form.getFieldValue('prod_lot_inspection_report') &&
                      <Link to={form.getFieldValue('prod_lot_inspection_report')} target={'_blank'}>View prod file</Link>
                    }
                  </Flex>
                </Form.Item>
              </div>

            </div>

            {reviewFinalReportForHirer &&
              <>
                <div className="row">
                  <div className="col">
                    <Form.Item
                      label="Order Completion Remarks (300 words)"
                      name="order_completion_remarks"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Please input your completion remarks!',
                        },
                      ]}
                    >
                      <TextArea rows={3} placeholder="Enter your remarks (max: 300 words)" maxLength={300} showCount required />
                    </Form.Item>
                  </div>
                  <div className="col">
                    <Form.Item label="Goods PickUp Date/Time" name={'final_goods_planned_pickup_datetime'} required tooltip={{
                      title: 'This is a required field',
                      // icon: <InfoCircleOutlined />,
                    }}
                      rules={[
                        {
                          required: true,
                          message: 'Please choose goods pickup date/time',
                        },
                      ]}
                    >

                      <DatePicker
                        disabledDate={disabledDate}
                        showTime
                        onChange={(value, dateString) => {
                          console.log('Selected Time: ', value);
                          console.log('Formatted goods pick Selected Time: ', dateString);
                          setGoodsPickUpDateTime(dateString);
                        }}
                        onOk={onOk}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <Button type='primary' onClick={() => submitFinalReportStatus("approved")}>Approved</Button>
                  </div>
                  <div className="col">
                    <Button onClick={() => submitFinalReportStatus("rework")}>Rework needed</Button>
                  </div>
                  <div className="col">
                    <Button type='primary' danger onClick={() => submitFinalReportStatus("rejected")}>Rejected</Button>
                  </div>

                </div>
                <hr />
              </>
            }

            <div className="row">
              <div className="col text-center">
                <Button type='primary' htmlType="submit">Send Order Completion Report</Button>
              </div>
            </div>
          </div>
        </Form>
      </Drawer>

    </>
  )
}

export default Orders;