import React, { useState, useEffect, useId } from 'react'
import HeaderTitle from '../../utils/HeaderTitle';
import { Card, Col, Row, Button, Input, Space, Select, AutoComplete, Spin, Form, Modal } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ViewMachineDetail from './ViewMachineDetail';
const { Search } = Input;
const { Meta } = Card;
const { Option } = Select;

function HireMachines() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [form] = Form.useForm();

    const [categories, setCategories] = useState([]);
    const [machineTypes, setMachineTypes] = useState([]);
    const [categoryValue, setCategoryValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedMachineCategory, setSelectedMachineCategory] = useState('');
    const [selectedMachineType, setSelectedMachineType] = useState('');

    const [categoryAndType, setCategoryAndType] = useState([]);
    // pagination
    const [pages, setPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showAllMachines, setShowAllMachines] = useState([]);
    // modal
    const [open, setOpen] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [passData, setPassData] = useState(null);

    const navigate = useNavigate();

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
                category: selectedMachineCategory,
                machineType: selectedMachineType,
                pincode: ''
            };

            const response = await axios.get(baseUrl, {
                params: queryParams,
            });

            // Handle the response data
            setShowAllMachines(response.data.results);
            console.log('Response data:', response.data);
        } catch (error) {
            // Handle errors
            console.error('Error fetching data:', error);
        }
    };

    const getAllMachinesCategoryAndType = async () => {
        try {
            const baseUrl = 'http://localhost:5100/api/machines/getMachinesByCatAndType';
            const response = await axios.get(baseUrl);
            const machineCategories = response.data;
            console.log("categoryNames: ", machineCategories);
            const machinesKey = Object.keys(machineCategories);
            setCategoryAndType(machineCategories);
            setCategories(machinesKey);
            console.log("machinesKey log: ", machinesKey);
        } catch (error) {
            // Handle errors
            console.error('Error getAllMachinesCategory data:', error);
        }
    }

    const getAllMachines = async () => {
        try {
            const apiUrl = `http://localhost:5100/api/machines/getAllMachines`; // Replace with your actual API endpoint
            const params = {
                page: pages,
                pageSize: pageSize,
                sortOrder: 'asc',
            };
            const machinesData = await axios.get(apiUrl, { params });
            setShowAllMachines(machinesData.data.results)
            console.log("machinesData: ", machinesData);
        } catch (error) {
            // Handle errors
            console.error('Error machinesData data:', error);
        }
    }

    const handleCategoryChange = (value) => {
        setCategoryValue(value);
        if (value) {
            const values = categoryAndType[value];
            setMachineTypes(values);
            console.log("setMachineTypes: ", values);
        }
        setSelectedMachineCategory(value);
    };

    const handleTypeChange = (value) => {
        console.log("handleTypeChange", value);
        setSelectedMachineType(value);
    };

    const handleMachineTypeChange = (value) => {
        setMachineTypeValue(value);
    };

    const clearSearch = () => {
        setCategoryAndType([]);
        setSelectedMachineType('');
        setSelectedMachineCategory('');
        getAllMachines();
    }

    const handleViewDetail = (machine) => {
        console.log("handleViewDetail: ", machine);
        setOpen(true);
        setShowViewModal(true);
        setPassData(machine);
    }

    useEffect(() => {
        getAllMachinesCategoryAndType();
        getAllMachines();
    }, []);

    return (
        <>
            <HeaderTitle title={'Hire a Machine'} />
            <Form form={form} layout='vertical'>
                <h4 style={{ textAlign: "left" }}>Search your machines</h4>
                <Row gutter={16}>
                    <Col>
                        <Form.Item name={'categoryInput'} label="Choose Machine Category" rules={[
                            { required: true, message: "You must choose the machine category" }
                        ]}>

                            <Select
                                style={{ width: '100%' }}
                                placeholder="Select Category"
                                onChange={handleCategoryChange}
                                value={selectedMachineCategory}
                            >
                                {loading ? (
                                    <Select.Option key="loading" disabled>
                                        <Spin />
                                    </Select.Option>
                                ) : (
                                    categories.map((item, index) => (
                                        <Select.Option key={index} value={item}>
                                            {item}
                                        </Select.Option>
                                    ))
                                )}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col>
                        <Form.Item name={'typeInput'} label="Choose Machine Type" rules={[
                            { required: true, message: "You must choose the machine type" }
                        ]}>
                            <Select

                                style={{ width: '100%' }}
                                placeholder="Select Machine Type"
                                onChange={handleTypeChange}
                                value={selectedMachineType}
                            >
                                {loading ? (
                                    <Select.Option key="loading" disabled>
                                        <Spin />
                                    </Select.Option>
                                ) : (
                                    machineTypes.map((item, index) => (
                                        <Select.Option key={index} value={item}>
                                            {item}
                                        </Select.Option>
                                    ))
                                )}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col>
                        <Form.Item
                            name="pincode"
                            label="Enter pincode"
                            rules={[
                                {
                                    pattern: /^[0-9]{6}$/, // Regex pattern to match exactly 6 digits
                                    message: 'Please enter a valid 6-digit',
                                },]}
                        >
                            <Input placeholder="Enter pincode" allowClear />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Button type="primary" onClick={fetchData} style={{ marginTop: "30px" }}>Search</Button>
                    </Col>
                    <Col>
                        <Button onClick={clearSearch} style={{ marginTop: "30px" }}>Clear search</Button>
                    </Col>
                </Row>
            </Form>
            <br />

            <Row gutter={[16, 16]}>
                {showAllMachines.map((machine) => (
                    <Col key={machine.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            cover={<img alt="example" src={`https://picsum.photos/200/300?random=${machine.id}`} style={{ objectFit: 'cover', maxHeight: 200 }} />}
                            actions={[
                                <Button onClick={() => handleViewDetail(machine)}>View Details</Button>,
                                <Button type="primary" onClick={() => navigate(`booking/${machine.id}`)}>Book</Button>,
                            ]}
                            style={{ width: '100%' }}
                        >
                            <Meta title={machine.companyName} />
                            <br />
                            <Meta style={{ textAlign: "justify" }} description={machine.Category} />
                            <br />
                            <Meta style={{ fontWeight: "bold", textAlign: "justify" }} description={machine.Machine_Type} />
                            <Meta
                                description={
                                    <ul style={{ fontWeight: "bold", listStyle: 'none', textAlign: "justify" }}>
                                        <li>Brand: {machine.Brand}</li>
                                        <li>Year: {machine.Year_of_Purchase}</li>
                                        <li>Model: {machine.Model}</li>
                                        <li>Score: {machine.Score}</li>
                                    </ul>
                                }

                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* // View Details */}
            {showViewModal && <ViewMachineDetail open={open} setOpen={setOpen} machine={passData} />}
        </>
    )
}

export default HireMachines;