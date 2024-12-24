import React, { useState, useEffect } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Tag, Table, message, Space, Modal } from 'antd';
import axios from '../../../api/axios';
import { ADMIN_PASSWORD_CHANGE, GET_COMPANY_DETAILS } from '../../../api/apiUrls';
const { Search } = Input;

function ListOfUsers() {
    const [form] = Form.useForm();
    const [search, setSearch] = useState(null);
    const [data, setData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        form.submit();

        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const getCompanyDetailsFN = async (email) => {
        // console.log("values: ", email);
        if(email){
            const params = {
                factoryEmail: email
            };
            try {
                const response = await axios.get(GET_COMPANY_DETAILS, {
                    params
                });
                message.success(`${response.data.result}`);
                setData(response.data);
                // console.log("getCompanyDetailsFN: ", response);
    
            } catch (error) {
                // console.log("getCompanyDetailsFN error: ", error);
                message.error(`${error && error.response ? error.response.data : 'There was an error! Please check the email or maybe email does not exist'}`);
                setData(null);
            }
        }else{
            setData(null);
        }
    }

    const updatePassword = async (email) => {
        // console.log("updatePassword: ", email);
        setUserEmail(email);
        setIsModalOpen(true);
    }

    const columns = [
        {
            title: 'Email',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'userId',
            render: (email) => (
                <Space Space size="middle">
                    <Button block onClick={() => updatePassword(email)} type='primary' disabled={!userEmail}>Update Password</Button>
                </Space >
            ),
        },
    ];

    const onFinish = async (values) => {
        try {
            var reqItem = {
                userId: userEmail,
                password: values.password
            }
            const response = await axios.patch(ADMIN_PASSWORD_CHANGE, reqItem);
            message.success(response.data);
            // console.log('response:', response);
            if (response && response.status == 200) {
                form.resetFields();
                // getCompanyDetailsFN(userEmail);
            }
            // console.log('Success:', values);
        } catch (error) {
            // console.log("ADMIN_PASSWORD_CHANGE error: ", error);
            message.error(`${error && error.response ? error.response.data : 'There was an error! Please check the password code!'}`);
            form.resetFields();
        }

    };

    const handleSearch = (value) => {
        // console.log("handleSearch: ", value);
        setUserEmail(value);
        getCompanyDetailsFN(value);
    };

    const onFinishFailed = (errorInfo) => {
        // console.log('Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
    };

    return (
        <>
            <Search
                placeholder="Enter email"
                enterButton="Search"
                size="large"
                onSearch={handleSearch}
                style={{ marginBottom: 16 }}
                allowClear
            />
            <br />
            <Table dataSource={[data]} columns={columns} bordered />

            <Modal title={`Update your Password for ${userEmail}`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText="Update">
                <div className='row'>
                    <div className="col">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                        >
                            <Form.Item label="Update your Password" name={'password'}
                                rules={[
                                    {
                                        message: 'Please update your password',
                                    },
                                ]}
                            >
                                <Input placeholder='Enter your password' />
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default ListOfUsers;