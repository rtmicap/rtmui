import { Button, Collapse, DatePicker, Flex, Form, Input, message, Modal, Select, Tooltip, Upload } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GET_FIRST_SAMPLE_REPORT_ORDERID_URL, UPDATE_FIRST_SAMPLE_REPORT_URL } from '../../api/apiUrls';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import axios from '../../api/axios';
import { LeftCircleOutlined, UploadOutlined } from "@ant-design/icons";
import moment from 'moment/moment';
import { formattedDateTime } from '../../utils/utils';
import { firstSampleProductStatus, uomChoices } from '../../utils/selectOptionUtils';
import SampleReportsDetails from '../Detail Pages/SampleReportsDetails';
const { TextArea } = Input;

function HirerSampleReports() {
    const location = useLocation();
    const [form] = Form.useForm();
    const { authUser } = useAuth();
    const { order, reviewSampleReports } = location.state || {};
    const navigate = useNavigate();

    const [sampleReportData, setSampleReportData] = useState([]);
    const [sampleReportStatus, setSampleReportStatus] = useState(null);

    const getSampleReportsByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_FIRST_SAMPLE_REPORT_ORDERID_URL}/${order.order_id}`)
            // console.log("reviewsampleReport: ", response.data);
            if (response && response.data && response.data.results.length > 0) {
                setSampleReportData(response.data.results);
                // Sort the results array by id in descending order to get the latest record
                const sortedDetails = response.data.results.sort(
                    (a, b) => new Date(b.id) - new Date(a.id)
                );
                console.log("sortedDetails: ", sortedDetails);
                const latestDetail = sortedDetails[0];
                console.log("latestDetail: ", latestDetail);
                if (latestDetail) {
                    // Set form fields based on the latest record data
                    form.setFieldsValue({
                        part_number: latestDetail.part_number,
                        part_name: latestDetail.part_name,
                        uom: latestDetail.UOM,
                        first_sample_quantity: latestDetail.first_sample_quantity,
                        inspection_date_time: moment(latestDetail.inspection_date_time),
                        first_sample_disposition: latestDetail.first_sample_disposition,
                        first_sample_remarks: latestDetail.first_sample_remarks,
                        first_sample_inspection_report: latestDetail.first_sample_inspection_report,
                        first_sample_id: latestDetail.id
                    });
                }
            }
        } catch (error) {
            console.log("getSampleReportsByOrderId err: ", error);
            message.error("Error while fetching sample report!");
        }
    }

    useEffect(() => {
        getSampleReportsByOrderId();
    }, []);

    const sampleReportStatusUpdate = async () => {
        const data = form.getFieldsValue();
        if (data.first_sample_disposition == "pending_approval" || data.first_sample_disposition == "") {
            message.info("Please update the First sample disposition status!")
        } else {
            try {
                data.first_sample_disposition = sampleReportStatus;
                data.orderid = order.order_id;
                data.first_sample_id = form.getFieldValue("first_sample_id");
                data.inspection_date_time = form.getFieldValue("inspection_date_time");
                // console.log("datta: ", data);
                const token = localStorage.getItem('authToken');
                axios.defaults.headers.common['authorization'] = 'Bearer ' + token;

                const response = await axios.patch(UPDATE_FIRST_SAMPLE_REPORT_URL, data);
                console.log("updated: ", response.data);
                message.success(response.data.message);
                navigate(-1);
            } catch (error) {
                console.log("error update: ", error);
                if (error && error.response.status == 401) {
                    message.warning("Unauthorized! Please log in again!");
                    navigate("/login");
                }else{
                    message.error("There is something error updating the sample report!");
                }
            }
        }
    }

    const onFinishFailedSampleReport = (errorInfo) => {
        console.log('Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
    };

    const handleStatusChange = (value) => {
        const selectedOption = firstSampleProductStatus.find(option => option.value === value);
        const selectedLabel = selectedOption ? selectedOption.label : '';
        let content;
        if (value == "rejected") {
            content = "This action will cancel the order and cannot be reverted";
        } else {
            content = `Are you sure you want to update the ${selectedLabel} status?`;
        }
        Modal.confirm({
            title: 'Confirm Status Change',
            content: content,
            okText: 'Yes',
            cancelText: 'No',
            cancelButtonProps: { danger: true },
            onOk: () => {
                setSampleReportStatus(value);
            },
            onCancel: () => {
                console.log('Status change canceled');
            },
        });
    };

    return (
        <>
            <div className="container">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={sampleReportStatusUpdate}
                    onFinishFailed={onFinishFailedSampleReport}
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
                                    </Tooltip>
                                </Form.Item>
                            </div>

                            <div className="col">

                                <Form.Item label="Inspection Date/Time" name={'inspection_date_time'} tooltip={{
                                    title: 'This is a required field',
                                    // icon: <InfoCircleOutlined />,
                                }}
                                >
                                    {form.getFieldValue('inspection_date_time') ? formattedDateTime(form.getFieldValue('inspection_date_time')) : 'Not updated by renter'}
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
                                    <Select placeholder='Choose sample disposition' onChange={(value) => handleStatusChange(value)} style={{ width: '100%' }} options={firstSampleProductStatus} />
                                </Form.Item>
                            </div>

                            <div className="col">
                                <Form.Item label="Inspection Report" name={'first_sample_inspection_report'}
                                >
                                    <Flex gap="small" wrap>
                                        {form.getFieldValue('first_sample_inspection_report') &&
                                            <Link to={form.getFieldValue('first_sample_inspection_report')} target={'_blank'}>View File</Link>
                                        }
                                    </Flex>
                                </Form.Item>
                            </div>

                        </div>

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
                                    <TextArea rows={3} placeholder="Enter your remarks (max: 300 words)" maxLength={300} showCount />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <Button type='primary' htmlType="submit">Update</Button>
                            </div>
                        </div>
                        <hr />
                        {/* Lists of Sample Reports details */}
                        <SampleReportsDetails order_id={order.order_id} />
                    </div>
                </Form>
            </div>
        </>
    )
}

export default HirerSampleReports