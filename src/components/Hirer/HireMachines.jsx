import React, { useState, useEffect } from 'react'
import HeaderTitle from '../../utils/HeaderTitle';
import { Card, Col, Row, Button, Input, Space, Select, AutoComplete, Spin } from 'antd';
import axios from 'axios';
const { Search } = Input;
const { Meta } = Card;
const { Option } = Select;

function HireMachines() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [categories, setCategories] = useState([]);
    const [machineTypes, setMachineTypes] = useState([]);
    const [categoryValue, setCategoryValue] = useState('');
    const [machineTypeValue, setMachineTypeValue] = useState('');
    const [loading, setLoading] = useState(false);

    const getAllUsers = async () => {
        try {
            const usersData = await axios.get("https://jsonplaceholder.typicode.com/users");
            console.log("usersData: ", usersData);
            setUsers(usersData.data)
            setTotalPages(Math.ceil(usersData.headers['x-total-count'] / 10));
        } catch (error) {
            console.error('Error fetching users:', error);
        }

    }

    const fetchData = async () => {
        try {
            const baseUrl = 'http://localhost:5100/api/booking/searchMachines';

            // query parameters
            const queryParams = {
                category: 'drilling',
                machineType: '',
                pincode: ''
            };

            const response = await axios.get(baseUrl, {
                params: queryParams,
            });

            // Handle the response data
            console.log('Response data:', response.data);
        } catch (error) {
            // Handle errors
            console.error('Error fetching data:', error);
        }
    };

    const getAllMachinesCategory = async () => {
        try {
            const baseUrl = 'http://localhost:5100/api/machines/getAllMachinesCategory';
            const response = await axios.get(baseUrl);
            const categories = response.data;
            const categoryNames = categories.map(user => ({ value: user.machineCategoryId, categoryName: user.categoryName }));
            console.log("categoryNames: ", categoryNames);
            setCategories(categoryNames);
            // Handle the response data
            console.log('Response getAllMachinesCategory data:', response.data);
        } catch (error) {
            // Handle errors
            console.error('Error getAllMachinesCategory data:', error);
        }
    }

    const getAllMachinesTypeByCategoryId = async () => {
        try {
            const baseUrl = 'http://localhost:5100/api/machines/getAllMachinesTypeByCategoryId/' + categoryValue;
            const response = await axios.get(baseUrl);
            const machineTypes = response.data;
            const machinesType = machineTypes.map(user => ({ value: user.machineCategoryId, typeName: user.typeName }));
            console.log("machinesType: ", machinesType);
            setMachineTypes(machinesType);
            // Handle the response data
            console.log('Response getAllMachinesTypeByCategoryId data:', response.data);
        } catch (error) {
            // Handle errors
            console.error('Error getAllMachinesTypeByCategoryId data:', error);
        }
    }

    const handleCategoryChange = (value) => {
        setCategoryValue(value);
    };

    const handleMachineTypeChange = (value) => {
        setMachineTypeValue(value);
    };

    useEffect(() => {
        getAllUsers();
        getAllMachinesCategory();
    }, []);

    return (
        <>
            <HeaderTitle title={'Hire a Machine'} />
            <Row gutter={16}>
                <h4>Search your machines or category or type or year...</h4>
                <Space.Compact
                    style={{
                        width: '100%',
                    }}
                >
                    {/* <Input placeholder='Search your machines...' /> */}
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select names and emails"
                        onChange={handleCategoryChange}
                        value={categoryValue}
                    >
                        {loading ? (
                            <Option key="loading" disabled>
                                <Spin />
                            </Option>
                        ) : (
                            categories.map(item => (
                                <Option key={item.value} value={item.value}>
                                    {item.categoryName}
                                </Option>
                            ))
                        )}
                    </Select>
                    <br />
                    <Button type="primary" onClick={fetchData}>Search</Button>
                </Space.Compact>
            </Row> <br />

            <Row gutter={[16, 16]}>
                {users.map((user) => (
                    <Col key={user.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            cover={<img alt="example" src={`https://picsum.photos/200/300?random=${user.id}`} style={{ objectFit: 'cover', maxHeight: 200 }} />}
                            actions={[
                                <Button type="primary" onClick={() => console.log(`Book ${user.name}`)}>Book</Button>,
                            ]}
                        >
                            <Meta title={user.name} />
                            <br />
                            <Meta description={user.email} />
                            <br />
                            <Meta description={user.phone} />
                            <br />
                            <Meta
                                description={
                                    <ul>
                                        <li>{user.address.street}</li>
                                        <li>{user.address.suite}</li>
                                        <li>{user.address.city}</li>
                                        <li>{user.address.zipcode}</li>
                                    </ul>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    )
}

export default HireMachines;