import { Button, Form, Input, Radio, Tooltip, DatePicker, Space, Upload, message, Flex, Result } from 'antd';
import React, { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LeftCircleOutlined, InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;
import axios from "../../api/axios";
import HeaderTitle from '../../utils/HeaderTitle';
import { FILE_UPLOAD_URL, QUOTE_SAVE_URL } from '../../api/apiUrls';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
const { TextArea } = Input;

function BookingMachines() {
    const location = useLocation();
    const navigate = useNavigate();
    // console.log("location: ", location);
    const { machineId } = useParams();
    // console.log("machineId: ", machineId);
    const [form] = Form.useForm();
    const [plannedStartDateTime, setPlannedStartDateTime] = useState('');
    const [plannedEndDateTime, setPlannedEndDateTime] = useState('');
    const [partDrawingFileList, setPartDrawingFileList] = useState([]);
    const [ProcessSheetFileList, setProcessSheetFileList] = useState([]);
    const [ProgramSheetFileList, setProgramSheetFileList] = useState([]);
    const [specsFileList, setSpecsFileList] = useState([]);
    const [othersFileList, setOthersFileList] = useState([]);

    // view file
    const [viewPartDrawingFile, setViewPartDrawingFile] = useState('');
    const [viewProcessSheetFile, setViewProcessSheetFile] = useState('');
    const [viewProgramSheetFile, setViewProgramSheetFile] = useState('');
    const [viewSpecsFile, setViewSpecsFile] = useState('');
    const [viewOthersFile, setViewOthersFile] = useState('');
    // loading file upload button
    const [fileLoading, setFileLoading] = useState(false);
    const [processFileLoading, setProcessFileLoading] = useState(false);
    const [programFileLoading, setProgramFileLoading] = useState(false);
    const [specsFileLoading, setSpecsFileLoading] = useState(false);
    const [othersFileLoading, setOthersFileLoading] = useState(false);
    // button loading
    const [loading, setLoading] = useState(false);
    const [quoteResponse, setQuoteResponse] = useState({});
    // steps 
    const [step, setStep] = useState(1);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

    const fileUpload = async (file) => {
        try {
            const configHeaders = {
                headers: { "content-type": "multipart/form-data" },
            };
            const formData = new FormData();
            formData.append("fileName", file.originFileObj);
            var response = await axios.post(FILE_UPLOAD_URL, formData, configHeaders);
            // console.log("responseFileData: ", response);
            return response.data.files[0];
        } catch (error) {
            return error;
        }
    }

    const onOk = (value) => {
        // console.log('onOk: ', value);
    };
    const onFinish = async (values) => {
        try {
            setLoading(true);
            values.plannedstartdatetime = plannedStartDateTime;
            values.plannedenddatetime = plannedEndDateTime;
            values.machineid = machineId;
            values.orderdrawing = viewPartDrawingFile;
            values.orderprocesssheet = viewProcessSheetFile;
            values.orderprogramsheet = viewProgramSheetFile;
            values.orderspec = viewSpecsFile;
            values.otherattachments = viewOthersFile;
            // console.log('onFinish:', values);
            const response = await axios.post(QUOTE_SAVE_URL, values);
            // console.log("save quote: ", response);
            message.success(`${response.data.message}`);
            setQuoteResponse(response.data.result);
            setStep(2);
            const timer = setTimeout(() => {
                navigate("/quotes", { replace: true })
            }, 4000);
            setLoading(false);
            return () => {
                clearTimeout(timer)
            };
        } catch (error) {
            message.error(`${error.response.data && error.response.data.detailType ? error.response.data.detailType : 'Error while updating the quote. Please try again!'}`);
            // console.log("quote error: ", error);
            setStep(1);
            setLoading(false);
        }

    }

    const onFinishFailed = (errorInfo) => {
        // console.log('Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
        setLoading(false);
    };

    const handlePartDrawingFileChange = async (info) => {
        let fileList = [...info.fileList];
        // Limit to only one file
        fileList = fileList.slice(-1);
        // console.log("size: ", fileList[0].size / 1024 / 1024 < 2);
        // Display an error message if more than one file is uploaded
        if (fileList.length > 1) {
            message.error('You can only upload one file');
        } else {
            setPartDrawingFileList(fileList);
            if (fileList[0].size / 1024 / 1024 < 2) { // upto 2 MB upload size
                setFileLoading(true);
                setIsSubmitDisabled(true);
                // update file upload api
                const fileRes = await fileUpload(fileList[0]);
                // console.log("fileRes: ", fileRes);
                message.success("Part Drawing File Uploaded")
                setViewPartDrawingFile(fileRes.fileUrl);
                setFileLoading(false);
                setIsSubmitDisabled(false);

            } else {
                message.error('File size must less than 2 MB');
            }
        }
    };

    const handleProcessSheetFileChange = async (info) => {
        let fileList = [...info.fileList];
        // Limit to only one file
        fileList = fileList.slice(-1);
        // console.log("size: ", fileList[0].size / 1024 / 1024 < 2);
        // Display an error message if more than one file is uploaded
        if (fileList.length > 1) {
            message.error('You can only upload one file');
        } else {
            setProcessSheetFileList(fileList);
            if (fileList[0].size / 1024 / 1024 < 2) { // upto 2 MB upload size
                setProcessFileLoading(true);
                setIsSubmitDisabled(true);
                // update file upload api
                const fileRes = await fileUpload(fileList[0]);
                // console.log("fileRes: ", fileRes);
                message.success("Process Sheet File Uploaded!")
                setViewProcessSheetFile(fileRes.fileUrl);
                setProcessFileLoading(false);
                setIsSubmitDisabled(false);
            } else {
                message.error('File size must less than 2 MB');
            }
        }
    }

    const handleProgramSheetFileChange = async (info) => {
        let fileList = [...info.fileList];
        // Limit to only one file
        fileList = fileList.slice(-1);
        // console.log("size: ", fileList[0].size / 1024 / 1024 < 2);
        // Display an error message if more than one file is uploaded
        if (fileList.length > 1) {
            message.error('You can only upload one file');
        } else {
            setProgramSheetFileList(fileList);
            if (fileList[0].size / 1024 / 1024 < 2) { // upto 2 MB upload size
                setProgramFileLoading(true);
                setIsSubmitDisabled(true);
                // update file upload api
                const fileRes = await fileUpload(fileList[0]);
                // console.log("fileRes: ", fileRes);
                message.success("Program Sheet File Uploaded!")
                setViewProgramSheetFile(fileRes.fileUrl);
                setProgramFileLoading(false);
                setIsSubmitDisabled(false);
            } else {
                message.error('File size must less than 2 MB');
            }
        }
    }

    const handleSpecsFileChange = async (info) => {
        let fileList = [...info.fileList];
        // Limit to only one file
        fileList = fileList.slice(-1);
        // console.log("size: ", fileList[0].size / 1024 / 1024 < 2);
        // Display an error message if more than one file is uploaded
        if (fileList.length > 1) {
            message.error('You can only upload one file');
        } else {
            setSpecsFileList(fileList);
            if (fileList[0].size / 1024 / 1024 < 2) { // upto 2 MB upload size
                setSpecsFileLoading(true);
                setIsSubmitDisabled(true);
                // update file upload api
                const fileRes = await fileUpload(fileList[0]);
                // console.log("fileRes: ", fileRes);
                message.success("Specs/Standards File Uploaded!")
                setViewSpecsFile(fileRes.fileUrl);
                setSpecsFileLoading(false);
                setIsSubmitDisabled(false);
            } else {
                message.error('File size must less than 2 MB');
            }
        }
    }


    const handleOthersFileChange = async (info) => {
        let fileList = [...info.fileList];
        // Limit to only one file
        fileList = fileList.slice(-1);
        // console.log("size: ", fileList[0].size / 1024 / 1024 < 2);
        // Display an error message if more than one file is uploaded
        if (fileList.length > 1) {
            message.error('You can only upload one file');
        } else {
            setOthersFileList(fileList);
            if (fileList[0].size / 1024 / 1024 < 2) { // upto 2 MB upload size
                setOthersFileLoading(true);
                setIsSubmitDisabled(true);
                // update file upload api
                const fileRes = await fileUpload(fileList[0]);
                // console.log("fileRes: ", fileRes);
                message.success("Others File Uploaded!")
                setViewOthersFile(fileRes.fileUrl);
                setOthersFileLoading(false);
                setIsSubmitDisabled(false);
            } else {
                message.error('File size must less than 2 MB');
            }
        }
    }

    const handlePartDrawingRemove = () => {
        setPartDrawingFileList([]);
        setViewPartDrawingFile('');
        form.setFieldsValue({
            orderdrawing: '' // empty the file list
        });
    };
    const handleProcessSheetRemove = () => {
        setProcessSheetFileList([]);
        setViewProcessSheetFile('');
    };
    const handleProgramSheetRemove = () => {
        setProgramSheetFileList([]);
        setViewProgramSheetFile('');
    };
    const handleSpecsRemove = () => {
        setSpecsFileList([]);
        setViewSpecsFile('');
    };
    const handleOthersRemove = () => {
        setOthersFileList([]);
        setViewOthersFile('');
    };

    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    return (
        <>
            <div className='container-fluid'>
                <HeaderTitle title={'Machine Booking Process'} />
                {step == 1 &&
                    <>
                        <div className='row'>
                            <div className='text-start'>
                                <Button type='primary' icon={<LeftCircleOutlined />} onClick={() => navigate(-1)} >Go Back</Button>
                            </div>
                        </div><br />
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                        >
                            <div className='row'>
                                <div className="col-auto">
                                    <Form.Item label="Planned Start Date" name={'plannedstartdatetime'} required tooltip={{
                                        title: 'This is a required field',
                                        icon: <InfoCircleOutlined />,
                                    }}
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please choose planned start date',
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
                                                const utcDate = dayjs(value).utc().format(); // Convert to UTC
                                                // console.log('Selected utcDate: ', utcDate);
                                                // console.log('Selected Time: ', value);
                                                // console.log('dateString Selected Time: ', dateString);
                                                setPlannedStartDateTime(utcDate);
                                            }}
                                            onOk={onOk}
                                        />
                                    </Form.Item>
                                </div>
                                <div className="col-auto">
                                    <Form.Item label="Planned End Date" name={'plannedenddatetime'} required tooltip={{
                                        title: 'This is a required field',
                                        icon: <InfoCircleOutlined />,
                                    }}
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please choose planned end date',
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
                                                const utcEndDate = dayjs(value).utc().format(); // Convert to UTC
                                                // console.log('Selected utcEndDate: ', utcEndDate);
                                                // console.log('Selected Time: ', value);
                                                // console.log('dateString Selected Time: ', dateString);
                                                setPlannedEndDateTime(utcEndDate);
                                            }}
                                            onOk={onOk}
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            <div className='row'>
                                <div className="col-lg-6">
                                    <Form.Item label="Order Quantity" required name={'quantity'} tooltip={{
                                        title: 'This is a required field',
                                        icon: <InfoCircleOutlined />,
                                    }}
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please update the order quantity!',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="input placeholder" style={{ width: '100%' }} />
                                    </Form.Item>
                                </div>
                                <div className="col-lg-6">
                                    <Form.Item
                                        label="Machine ID"
                                        name={'machineid'}
                                    >
                                        <Tooltip title={`Machine ID is ${machineId}. You can't modify.`}>
                                            <Input placeholder="input placeholder" defaultValue={machineId} style={{ width: '100%' }} readOnly />
                                        </Tooltip>
                                    </Form.Item>
                                </div>
                            </div>

                            {/* Files Upload */}
                            <div className='row'>
                                <div className="col-lg-6">
                                    <Form.Item label="Part Drawing" name={'orderdrawing'} tooltip={{
                                        title: 'This is a required field',
                                        icon: <InfoCircleOutlined />,
                                    }} rules={[
                                        {
                                            required: true,
                                            message: 'Please upload part drawing!',
                                        },
                                    ]}>
                                        <Flex gap="small" wrap>
                                            <Upload
                                                fileList={partDrawingFileList}
                                                onChange={handlePartDrawingFileChange}
                                                maxCount={1}
                                                beforeUpload={() => false}
                                                onRemove={handlePartDrawingRemove}
                                                data={(file) => file.fileName = "FOO"}
                                            >
                                                <Button loading={fileLoading} icon={<UploadOutlined />}>{fileLoading ? 'Uploading..' : 'Upload Part Drawing'}</Button>
                                            </Upload>
                                            {viewPartDrawingFile &&
                                                <Link to={viewPartDrawingFile} target={'_blank'}>View Part Drawing File</Link>
                                            }
                                        </Flex>

                                    </Form.Item>

                                </div>
                                <div className="col-lg-6">
                                    <Form.Item label="Program Sheet" name={'orderprogramsheet'}>
                                        <Flex gap="small" wrap>
                                            <Upload
                                                fileList={ProgramSheetFileList}
                                                onChange={handleProgramSheetFileChange}
                                                maxCount={1}
                                                beforeUpload={() => false}
                                                onRemove={handleProgramSheetRemove}
                                            >
                                                <Button loading={programFileLoading} icon={<UploadOutlined />}>{programFileLoading ? 'Uploading..' : 'Upload Program Sheet'}</Button>
                                            </Upload>
                                            {viewProgramSheetFile &&
                                                <Link to={viewProgramSheetFile} target={'_blank'}>View Program Sheet File</Link>
                                            }
                                        </Flex>
                                    </Form.Item>

                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-6">
                                    <Form.Item label="Process Sheet" name={'orderprocesssheet'}>
                                        <Flex gap="small" wrap>
                                            <Upload
                                                fileList={ProcessSheetFileList}
                                                onChange={handleProcessSheetFileChange}
                                                maxCount={1}
                                                beforeUpload={() => false}
                                                onRemove={handleProcessSheetRemove}
                                            >
                                                <Button loading={processFileLoading} icon={<UploadOutlined />}>{processFileLoading ? 'Uploading..' : 'Upload Process Sheet'}</Button>
                                            </Upload>
                                            {viewProcessSheetFile &&
                                                <Link to={viewProcessSheetFile} target={'_blank'}>View Process Sheet File</Link>
                                            }
                                        </Flex>
                                    </Form.Item>

                                </div>
                                <div className="col-lg-6">
                                    <Form.Item label="Specifications/Standards" name={'orderspec'}>
                                        <Flex gap="small" wrap>
                                            <Upload
                                                fileList={specsFileList}
                                                onChange={handleSpecsFileChange}
                                                maxCount={1}
                                                beforeUpload={() => false}
                                                onRemove={handleSpecsRemove}
                                            >
                                                <Button loading={specsFileLoading} icon={<UploadOutlined />}>{specsFileLoading ? 'Uploading..' : 'Upload Specs/Standards'}</Button>
                                            </Upload>
                                            {viewSpecsFile &&
                                                <Link to={viewSpecsFile} target={'_blank'}>View Specs/Standards File</Link>
                                            }
                                        </Flex>
                                    </Form.Item>

                                </div>
                            </div>

                            <div className='row'>
                                <div className="col-lg-6">
                                    <Form.Item label="Any other files if any" name={'otherattachments'}>
                                        <Flex gap="small" wrap>
                                            <Upload
                                                fileList={othersFileList}
                                                onChange={handleOthersFileChange}
                                                maxCount={1}
                                                beforeUpload={() => false}
                                                onRemove={handleOthersRemove}
                                            >
                                                <Button loading={othersFileLoading} icon={<UploadOutlined />}>{othersFileLoading ? 'Uploading..' : 'Upload Other Files'}</Button>
                                            </Upload>
                                            {viewOthersFile &&
                                                <Link to={viewOthersFile} target={'_blank'}>View Others File</Link>
                                            }
                                        </Flex>
                                    </Form.Item>

                                </div>

                                <div className="col-lg-6">
                                    <Form.Item
                                        label="Please provide planned shipment details"
                                        name={'comments'}
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please provide your planned shipment details!',
                                            },
                                        ]}
                                        required
                                    >
                                        <TextArea rows={3} placeholder="Enter your planned shipment details (max: 500 words)" maxLength={500} showCount />
                                    </Form.Item>
                                </div>
                            </div>
                            <Form.Item
                                wrapperCol={{
                                    offset: 8,
                                    span: 16,
                                }}
                            >
                                <Button type="primary" htmlType="submit" disabled={isSubmitDisabled ? true : false}>
                                    {loading ? 'Booking your quote..' : 'Submit'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                }

                {step == 2 &&
                    <>
                        <div className="container-fluid">
                            <Result
                                status="success"
                                title="Your quote sent successfully to the selected supplier. Await their response shortly!"
                                subTitle={`Your Quote ID: ${quoteResponse.quote_id}`}
                                extra={[
                                    // <Button type="primary" key="console">
                                    //     Go Console
                                    // </Button>,
                                    // <Button key="buy">Buy Again</Button>,
                                    <p>Redirecting to My Quotes Page...</p>
                                ]}
                            />
                        </div>
                    </>
                }
            </div>
        </>
    )
}

export default BookingMachines