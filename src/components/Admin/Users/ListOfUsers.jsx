import React, { useState, useEffect } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Tag, Table, message } from 'antd';
import { getCompanyDetails } from '../../Api/adminApiServices';
const { Search } = Input;

function ListOfUsers() {
    const [form] = Form.useForm();
    const [search, setSearch] = useState(null);
    const [data, setData] = useState(null);

    const getCompanyDetailsFN = async (email) => {
        console.log("values: ", email);
        const params = {
            factoryEmail: email
        };
        try {
            const response = await getCompanyDetails(params);
            message.success(`${response.data.result}`);
            setData(response.data);
            console.log("getCompanyDetailsFN: ", response);
        } catch (error) {
            console.log("getCompanyDetailsFN error: ", error);
            message.error('There was an error! Please check the email or maybe email does not exist');
            setData(null);
        }
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
        }
    ];

    const onFinish = (values) => {
        setSearch(values)
        console.log('Success:', values);
    };

    const handleSearch = (value) => {
        console.log("handleSearch: ", value);
        getCompanyDetailsFN(value);
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
            <Table dataSource={[data]} columns={columns} bordered />;
        </>
    )
}

export default ListOfUsers;