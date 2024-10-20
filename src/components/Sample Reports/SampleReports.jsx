import { Button, Collapse, DatePicker, Flex, Form, Input, message, Select, Tooltip, Upload } from 'antd';
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LeftCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from 'react';
import { CREATE_FIRST_SAMPLE_REPORT_URL, FILE_UPLOAD_URL, GET_FIRST_SAMPLE_REPORT_ORDERID_URL, UPDATE_FIRST_SAMPLE_REPORT_URL } from '../../api/apiUrls';
import dayjs from 'dayjs';
import { sampleDisposition, uomChoices } from '../Orders/OrderUtils';
import axios from '../../api/axios';
import { formattedDateTime } from '../../utils/utils';
import moment from 'moment/moment';
const { TextArea } = Input;

function SampleReports() {
    const location = useLocation();
    const [form] = Form.useForm();
    const { authUser } = useAuth();
    const { order, reviewSampleReports } = location.state || {};
    const navigate = useNavigate();

    const [inspectionDateTime, setInspectionDateTime] = useState('');
    const [sampleReportStatus, setSampleReportStatus] = useState(null);
    const [inspectionReportFileList, setInspectionReportFileList] = useState([]);
    const [fileReportLoading, setFileReportLoading] = useState(false);
    const [viewInspectionReportFile, setViewInspectionReportFile] = useState('');
    const [sampleReportData, setSampleReportData] = useState([]);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);


    const getSampleReportsByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_FIRST_SAMPLE_REPORT_ORDERID_URL}/${order.order_id}`)
            // console.log("reviewsampleReport: ", response.data);
            if (response && response.data && response.data.results.length > 0) {
                setSampleReportData(response.data.results);
                // Sort the results array by inspection_date_time in descending order to get the latest record
                const sortedDetails = response.data.results.sort(
                    (a, b) => new Date(a.inspection_date_time) - new Date(b.inspection_date_time)
                );
                console.log("sortedDetails: ", sortedDetails);
                const latestDetail = sortedDetails[0];
                console.log("latestDetail: ", latestDetail);
                if (latestDetail) {
                    // Set form fields based on the latest record data
                    if (authUser.CompanyId == order.hirer_company_id) {
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
            }
        } catch (error) {
            console.log("getSampleReportsByOrderId err: ", error);
            message.error("Error while fetching sample report!");
        }
    }

    useEffect(() => {
        getSampleReportsByOrderId();
    }, []);

    const sampleReportStatusUpdate = async (value) => {
        const data = form.getFieldsValue();
        if (data.first_sample_disposition == "pending_approval") {
            message.info("Please update the First sample disposition!")
        } else {
            try {
                // console.log("datta sampleReportStatusUpdate: ", value);
                data.first_sample_disposition = value;
                data.orderid = order.order_id;
                data.first_sample_id = form.getFieldValue("first_sample_id");
                data.inspection_date_time = form.getFieldValue("inspection_date_time");
                // console.log("datta: ", data);
                const response = await axios.patch(UPDATE_FIRST_SAMPLE_REPORT_URL, data);
                console.log("updated: ", response.data);
                message.success(response.data.message);
                navigate(-1);
            } catch (error) {
                console.log("error update: ", error);
                message.error("There is some error!");
            }
        }
    }

    const onFinishReport = async (values) => {
        values.orderid = order.order_id;
        values.inspection_date_time = inspectionDateTime;
        values.first_sample_inspection_report = viewInspectionReportFile;
        values.first_sample_disposition = "pending_approval";
        console.log('onFinishReport:', values);
        const response = await axios.post(CREATE_FIRST_SAMPLE_REPORT_URL, values);
        message.success(`${response.data.message}`);
        navigate(-1);
    }

    const handleSampleReportSubmit = async (values) => {
        if (reviewSampleReports && sampleReportStatus) {
            sampleReportStatusUpdate(sampleReportStatus);
        } else {
            onFinishReport(values);
        }
    }

    const onFinishFailedSampleReport = (errorInfo) => {
        console.log('Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
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
            if (fileList[0].size / 1024 / 1024 < 3) { // upto 3 MB upload size
                setFileReportLoading(true);
                // update file upload api
                const fileRes = await fileUpload(fileList[0]);
                // console.log("fileRes: ", fileRes);
                message.success("Inspection Report File Uploaded!")
                setViewInspectionReportFile(fileRes.fileUrl);
                setFileReportLoading(false);
            } else {
                message.error('File size must less than 3 MB');
            }
        }
    }

    const handleInspectionReportRemove = () => {
        setInspectionReportFileList([]);
        setViewInspectionReportFile('');
    };

    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    const onOk = (value) => {
        console.log('onOk: ', value);
    };

    const collapseItems = sampleReportData.map((item, index) => ({
        key: item.id,
        label: `Part Number: ${item.part_number} (${item.part_name})`,
        children: (
            <div className='row'>
                <div className="col">
                    <p><strong>Quantity:</strong> {item.first_sample_quantity}</p>
                    <p><strong>UOM:</strong> {item.UOM}</p>
                    <p><strong>Inspection Date:</strong> {formattedDateTime(item.inspection_date_time)}</p>
                    <p><strong>Disposition:</strong> {item.first_sample_disposition}</p>
                    <p><strong>Report:</strong> <a href={item.first_sample_inspection_report} target="_blank" rel="noopener noreferrer">View Report</a></p>
                    {item.first_sample_remarks && (
                        <p><strong>Remarks:</strong> {item.first_sample_remarks}</p>
                    )}
                </div>
            </div>
        ),
    }));

    return (
        <>
            <div className="container">
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
                <h5 className='text-center'>Sample Report for Order ID: {order.order_id}</h5>
                <hr />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSampleReportSubmit}
                    onFinishFailed={onFinishFailedSampleReport}
                >
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col">
                                <Form.Item
                                    label="Order ID"
                                    name={'orderid'}
                                >
                                    <Tooltip title={`Order ID is ${order.order_id}. You can't modify.`}>
                                        <Input placeholder="input placeholder" defaultValue={order.order_id} style={{ width: '100%' }} readOnly />
                                    </Tooltip>
                                </Form.Item>
                            </div>

                            <div className="col">

                                <Form.Item label="Inspection Date/Time" name={'inspection_date_time'} tooltip={{
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
                                    {!reviewSampleReports &&
                                        <DatePicker
                                            disabledDate={disabledDate}
                                            showTime={{
                                                format: 'hh:mm A',
                                                use12Hours: true,
                                            }}
                                            onChange={(value, dateString) => {
                                                console.log('Selected Time: ', value);
                                                console.log('Formatted Selected Time: ', dateString);
                                                setInspectionDateTime(dateString);
                                            }}
                                            onOk={onOk}
                                        />
                                    }

                                </Form.Item>
                                {reviewSampleReports && (
                                    <>{form.getFieldValue('inspection_date_time') ? formattedDateTime(form.getFieldValue('inspection_date_time')) : 'Not updated by renter'}</>
                                )}
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
                            {authUser.CompanyId == order.hirer_company_id &&
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
                                <Form.Item label="Attach Inspection Report (Max: 3 MB Size)" required name={'first_sample_inspection_report'} tooltip={{
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
                                            accept=".pdf,.csv"
                                        >
                                            {!reviewSampleReports &&
                                                <Button type='link' loading={fileReportLoading} icon={<UploadOutlined />}>{fileReportLoading ? 'Uploading..' : 'Attach Report'}</Button>
                                            }
                                        </Upload>
                                        {!reviewSampleReports && viewInspectionReportFile &&
                                            <Link to={viewInspectionReportFile} target={'_blank'}>View File</Link>
                                        }

                                        {reviewSampleReports &&
                                            <Link to={form.getFieldValue('first_sample_inspection_report')} target={'_blank'}>View report file</Link>
                                        }
                                    </Flex>
                                </Form.Item>
                            </div>

                        </div>

                        {reviewSampleReports &&
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
                                            <TextArea rows={3} placeholder="Enter your remarks (max: 300 words)" maxLength={300} showCount />
                                        </Form.Item>
                                    </div>
                                </div>

                            </>
                        }
                        {/* only renter can create sample report */}
                        {authUser.CompanyId == order.renter_company_id &&
                            <div className="row">
                                <div className="col">
                                    <Button type='primary' htmlType="submit">Share FSIR to {reviewSampleReports ? 'Renter' : 'Hirer'}</Button>
                                </div>
                            </div>
                        }
                        {/* only hirer can review sample report */}
                        {authUser.CompanyId == order.hirer_company_id &&
                            <>
                                <div className="row">
                                    <div className="col">
                                        <Button type='primary' htmlType="submit" onClick={() => setSampleReportStatus("approved")}>Approved & Proceed for Production</Button>
                                    </div>
                                    <div className="col">
                                        <Button htmlType="submit" onClick={() => setSampleReportStatus("repeat_sample")}>Do Resample</Button>
                                    </div>
                                    <div className="col">
                                        <Button type='primary' htmlType="submit" danger onClick={() => setSampleReportStatus("rejected")}>Reject & Cancel Order</Button>
                                    </div>
                                </div>
                                <hr />
                            </>
                        }

                    </div>
                </Form>
                <hr />
                {/* Lists of sample Reports */}
                {sampleReportData && sampleReportData.length > 0 && authUser.CompanyId == order.renter_company_id &&
                    <>
                        <h6>Lists of updated sample reports:</h6>
                        <Collapse items={collapseItems} />
                    </>
                }
            </div>
        </>
    )
}

export default SampleReports