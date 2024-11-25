import { Button, Collapse, DatePicker, Flex, Form, Input, message, Select, Tooltip, Upload } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CREATE_FIRST_SAMPLE_REPORT_URL, FILE_UPLOAD_URL } from '../../api/apiUrls';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import axios from '../../api/axios';
import { LeftCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { uomChoices } from '../../utils/selectOptionUtils';
import SampleReportsDetails from '../Detail Pages/SampleReportsDetails';

function RenterSampleReports() {
    const location = useLocation();
    const [form] = Form.useForm();
    const { authUser } = useAuth();
    const { order, reviewSampleReports } = location.state || {};
    const navigate = useNavigate();

    const [inspectionDateTime, setInspectionDateTime] = useState('');
    const [inspectionReportFileList, setInspectionReportFileList] = useState([]);
    const [fileReportLoading, setFileReportLoading] = useState(false);
    const [viewInspectionReportFile, setViewInspectionReportFile] = useState('');

    const currentUserCompanyId = authUser && authUser.CompanyId;

    const onFinishReport = async (values) => {
        try {
            values.orderid = order.order_id;
            values.inspection_date_time = inspectionDateTime;
            values.first_sample_inspection_report = viewInspectionReportFile;
            values.first_sample_disposition = "pending_approval";
            console.log('onFinishReport:', values);
            const response = await axios.post(CREATE_FIRST_SAMPLE_REPORT_URL, values);
            message.success(`${response.data.message}`);
            navigate(-1);
        } catch (error) {
            console.log('onFinishReport err:', error);
            message.error(`${error && error.response.data ? error.response.data.error : 'Something went wrong while creating the sample report!'}`);
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
        form.setFieldsValue({
            first_sample_inspection_report: '',  // Reset the specific field by setting it to an empty string
        });
    };

    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    const onOk = (value) => {
        console.log('onOk: ', value);
    };

    return (
        <>
            <div className="container">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishReport}
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
                                    <div>{order.quote_id} </div>
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
                                            <Button type='link' loading={fileReportLoading} icon={<UploadOutlined />}>{fileReportLoading ? 'Uploading..' : 'Attach Report'}</Button>
                                        </Upload>
                                        {viewInspectionReportFile &&
                                            <Link to={viewInspectionReportFile} target={'_blank'}>View File</Link>
                                        }
                                    </Flex>
                                </Form.Item>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col">
                                <Button type='primary' htmlType="submit" disabled={fileReportLoading?true:false}>Share FSIR to Hirer</Button>
                            </div>
                        </div>
                    </div>
                </Form>
                {/* Lists of Sample Reports details */}
                {/* {<SampleReportsDetails order_id={order.order_id} />} */}
            </div>
        </>
    )
}

export default RenterSampleReports