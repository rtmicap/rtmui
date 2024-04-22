import { Form, DatePicker, Select, Checkbox, Input, Upload, Button, Tooltip, Divider } from 'antd';
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
const { RangePicker } = DatePicker;
import { PlusOutlined, UploadOutlined, CaretLeftOutlined } from '@ant-design/icons';

function Booking() {
    const { machineId } = useParams();
    const navigate = useNavigate();

    const onOk = (value) => {
        console.log('onOk: ', value);
    };

    const onStartDateChange = (value, dateString) => {
        console.log('Selected Time: ', value);
        console.log('Formatted Selected Time: ', dateString);
    };

    const onEndDateChange = (value, dateString) => {
        console.log('Selected onEndDateChange Time: ', value);
        console.log('Formatted onEndDateChange Selected Time: ', dateString);
    };

    const props = {
        name: 'file',
        action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    return (
        <>
            <h2>Machine Booking Process {machineId}</h2>
            <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
                <Button type="primary" shape="round" icon={<CaretLeftOutlined />} onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
            <Divider plain></Divider>
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                style={{ maxWidth: 800 }}
            >
                <Form.Item label="Planned Start">
                    <DatePicker showTime onChange={onStartDateChange} onOk={onOk} />
                </Form.Item>
                <Form.Item label="Planned End">
                    <DatePicker showTime onChange={onEndDateChange} onOk={onOk} />
                </Form.Item>
                {/* <Form.Item label="RangePicker">
                        <RangePicker />
                    </Form.Item> */}
                <Form.Item label="Agreed Hours">
                    <Input style={{ width: "70%" }} />
                </Form.Item>
                <Form.Item label="Agreed Hour Rate">
                    <Input style={{ width: "70%" }} />
                </Form.Item>
                <Form.Item label="Quantity">
                    <Input style={{ width: "70%" }} />
                </Form.Item>
                <Form.Item label="Part Drawing" valuePropName="fileList">
                    <Upload {...props}>
                        <Button icon={<UploadOutlined />}>Click to Upload Part Drawing</Button>
                    </Upload>
                </Form.Item>

                <Form.Item label="Process Sheet" valuePropName="fileList">
                    <Upload {...props}>
                        <Button icon={<UploadOutlined />}>Click to Upload Process Sheet</Button>
                    </Upload>
                </Form.Item>
                <Form.Item label="Program File" valuePropName="fileList">
                    <Upload {...props}>
                        <Button icon={<UploadOutlined />}>Click to Upload Program File</Button>
                    </Upload>
                </Form.Item>
                <Form.Item label="Specs" valuePropName="fileList">
                    <Upload {...props}>
                        <Button icon={<UploadOutlined />}>Click to Upload Specs</Button>
                    </Upload>
                </Form.Item>
                <Button type='primary'>Book Machine</Button>
            </Form>
        </>
    )
}

export default Booking