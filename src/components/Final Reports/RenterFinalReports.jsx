import { Button, Collapse, DatePicker, Flex, Form, Input, message, Select, Tooltip, Upload } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LeftCircleOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import moment from 'moment/moment';
import { CREATE_FINAL_REPORT_URL } from '../../api/apiUrls';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import { uomChoices } from '../../utils/selectOptionUtils';
import FinalReportsDetails from '../Detail Pages/FinalReportsDetails';
import FileUploadComponent from '../FileUploadComponent/FileUploadComponent';
import uploadFileToServer from '../FileUploadComponent/uploadFileToServer';
import FileUploader from '../FileUploadComponent/FileUploader';
const { TextArea } = Input;

function RenterFinalReports() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewFinalReports } = location.state || {};
    const [form] = Form.useForm();

    const [finalReportDispositionStatus, setFinalReportDispositionStatus] = useState(null);
    const [finalReportData, setFinalReportData] = useState([]);
    const [goodsPickUpDateTime, setGoodsPickUpDateTime] = useState('');
    const [prodInspectionReportFileList, setProdInspectionReportFileList] = useState([]);
    const [viewProdLotInspectionReportFile, setViewProdLotInspectionReportFile] = useState('');
    const [fileFinalReportLoading, setFileFinalReportLoading] = useState(false);
    const [orderCompletionDateTime, setOrderCompletionDateTime] = useState('');
    const [fileList, setFileList] = useState([]);
    
    const currentUserCompanyId = authUser && authUser.CompanyId;
    const navigate = useNavigate();

    const getFinalReportsByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_FINAL_SAMPLE_REPORT_ORDERID_URL}/${order.order_id}`)
            // console.log("getFinalReportsByOrderId: ", response.data);
            if (response && response.data && response.data.results.length > 0) {
                setFinalReportData(response.data.results);
            }
        } catch (error) {
            // console.log("getFinalReportsByOrderId err: ", error);
            setLoading(false);
            if (response.data.results.length != 0) {
                message.error("Error while fetching final report!");
            }
        }
    }

    useEffect(() => {
        getFinalReportsByOrderId();
    }, []);

    const onFinishFinalReport = async (values) => {
        try {
            const data = form.getFieldsValue();
            // console.log("get Data: ", data);
            values.orderid = order.order_id;
            values.final_goods_planned_pickup_datetime = goodsPickUpDateTime;
            values.completion_date_time = orderCompletionDateTime;
            values.prod_lot_inspection_report = viewProdLotInspectionReportFile;
            values.final_product_disposition = "pending_approval";
            values.first_sample_id = form.getFieldValue("first_sample_id");
            // console.log('onFinishFinalReport:', values);
            const token = localStorage.getItem('authToken');
            axios.defaults.headers.common['authorization'] = 'Bearer ' + token;

            const response = await axios.post(CREATE_FINAL_REPORT_URL, values);
            message.success(`${response.data.message}`);
            navigate(-1);
        } catch (error) {
            if (error && error.response.status == 401) {
                message.warning("Unauthorized! Please log in again!");
                navigate("/login");
            } else {
                message.error("There is some error while creating final report!");
            }
        }
    }

    const onFinishFailedFinalReport = (errorInfo) => {
        // console.log('onFinishFailedFinalReport Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
    };

    const validateOrderQuantity = (_, value) => {
        if (value && order.quantity !== null && value > order.quantity) {
            return Promise.reject(new Error(`Quantity must not be greater than ${order.quantity}`));
        }
        return Promise.resolve();
    };

    const onOk = (value) => {
        // console.log('onOk: ', value);
    };

    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    const handleFileUpload = async (file, name) => {
        setFileFinalReportLoading(true);
        try {
            const fileUrl = await uploadFileToServer(file, name);
            // console.log('Uploaded file URL:', fileUrl);
            setViewProdLotInspectionReportFile(fileUrl);
            return fileUrl;
        } finally {
            setFileFinalReportLoading(false);
        }
    };

    const handleRemoveFile = () => {
        setViewProdLotInspectionReportFile('');
        form.setFieldsValue({
            prod_lot_inspection_report: '' // empty the file list
        });
    };

    const handleProductionReportChange = (files) => {
        console.log("upload prod inspection files: ", files);
        if (files.length > 0) {
            // Assuming the first file's URL is what we want
            setViewProdLotInspectionReportFile(files[0].url);
        }
    }

    return (
        <>
            <div>
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
                <h5 className='text-center'>Final Report</h5>
                <hr />
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
                                    <Tooltip title={`Cannot change Order ID.`}>
                                        <div>{order.quote_id} </div>
                                        {/* <Input placeholder="input placeholder" defaultValue={order.order_id} style={{ width: '100%' }} readOnly /> */}
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
                                    <DatePicker
                                        // disabledDate={disabledDate}
                                        showTime={{
                                            format: 'hh:mm A',
                                            use12Hours: true,
                                        }}
                                        onChange={(value, dateString) => {
                                            // console.log('Selected Time: ', value);
                                            // console.log('Formatted Selected Time: ', dateString);
                                            setOrderCompletionDateTime(dateString);
                                        }}
                                        onOk={onOk}
                                    />
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
                                <Form.Item label="Part Number" name={'part_number'}>
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
                                        {
                                            validator: validateOrderQuantity,
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
                            <div className="col">
                                <Form.Item label="Prod Lot Inspection Report" required name={'prod_lot_inspection_report'} tooltip={{
                                    title: 'File size should be maximum 3 MB'
                                }}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please attach the prod lot inspection report!',
                                        },
                                    ]}
                                >
                                    <FileUploader
                                        value={fileList}
                                        onChange={handleProductionReportChange}
                                        maxCount={1}
                                        acceptFile=".pdf,.xlsx,.xls"
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col text-center">
                                <Button type='primary' htmlType="submit" disabled={fileFinalReportLoading ? true : false}>Send Order Completion Report</Button>
                            </div>
                        </div>
                        <hr />
                        {/* Lists of Final Reports details */}
                        <FinalReportsDetails order_id={order.order_id} />
                    </div>
                </Form>

            </div>
        </>
    )
}

export default RenterFinalReports