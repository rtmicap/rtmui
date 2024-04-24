import React, { useState, useEffect, useId } from 'react'
import HeaderTitle from '../../utils/HeaderTitle';
import { Card, Col, Row, Button, Input, Space, Select, Statistic, Spin, Form, Modal, Badge, Dropdown, message, Result, Empty, Divider, Typography } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ViewMachineDetail from './ViewMachineDetail';
const { Search } = Input;
const { Meta } = Card;
const { Option } = Select;
import Config from '../../env.json'
import { useAuth } from '../../contexts/AuthContext';
import { FileSearchOutlined, WechatOutlined } from '@ant-design/icons';
import { LikeOutlined, MessageOutlined, DownOutlined } from '@ant-design/icons';
import { Avatar, List } from 'antd';
import "./style.css";

const { Title, Text } = Typography;

function HireMachines() {
    const { authUser } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
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
    const [totalPages, setTotalPages] = useState(null);
    // modal
    const [open, setOpen] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [passData, setPassData] = useState(null);

    const navigate = useNavigate();

    const fetchData = async (pages) => {
        try {
            setLoading(true);
            const baseUrl = `${Config.localEndpoint}/api/booking/searchMachines`;

            // query parameters
            const queryParams = {
                category: selectedMachineCategory,
                machineType: selectedMachineType,
                page: pages
            };

            const response = await axios.get(baseUrl, {
                params: queryParams,
            });

            // Handle the response data
            setShowAllMachines(response.data.paginatedResults);
            setPages(response.data.page);
            setPageSize(response.data.pageSize);
            setTotalPages(response.data.totalItems);
            message.success(response.data.message);
            setLoading(false);
            console.log('Response data:', response.data);
        } catch (error) {
            // Handle errors
            setLoading(false);
            message.error("There is some error while searching the machine!", error.message);
            console.error('Error fetching data:', error);
        }
    };

    const getAllMachinesCategoryAndType = async () => {
        try {
            const baseUrl = `${Config.localEndpoint}/api/machines/getMachinesByCatAndType`;
            // const baseUrl = 'http://localhost:5100/api/machines/getMachinesByCatAndType';
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

    const getAllMachines = async (pages) => {
        try {
            setLoading(true);
            const apiUrl = `${Config.localEndpoint}/api/machines/getAllMachines`;
            // const apiUrl = `http://localhost:5100/api/machines/getAllMachines`; // Replace with your actual API endpoint
            const params = {
                page: pages,
            };
            const machinesData = await axios.get(apiUrl, { params });
            setShowAllMachines(machinesData.data.paginatedResults);
            setPages(machinesData.data.page);
            setPageSize(machinesData.data.pageSize);
            setTotalPages(machinesData.data.totalItems);
            message.success(machinesData.data.message);
            setLoading(false);
            console.log("all machinesData: ", machinesData);
        } catch (error) {
            // Handle errors
            setLoading(false);
            message.error("There is some error!", error.message);
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
        setSelectedMachineCategory('');
        setSelectedMachineType('');
        setTotalPages(null);
        form.resetFields();
        // getAllMachines();
    }

    const handleViewDetail = (machine) => {
        console.log("handleViewDetail: ", machine);
        setOpen(true);
        setShowViewModal(true);
        setPassData(machine);
    }

    useEffect(() => {
        getAllMachinesCategoryAndType();
        // getAllMachines();
    }, []);



    const formatUpperCase = (text) => {
        return <strong>{text.toUpperCase()}</strong>;
    }

    const onShowSizeChange = (current, pageSize) => {
        console.log("onShowSizeChange:", current, pageSize);
    };

    const handlePageChange = (page, pageSize) => {
        setPages(page);
        if (selectedMachineType && selectedMachineCategory) {
            fetchData(page);
        } else {
            // alert("get all");
            getAllMachines(page);
        }
        console.log("handlePageChange:", page, pageSize);
    }

    const searchData =
        (
            <Result
                icon={<FileSearchOutlined />}
                title="Please search the type of machine you would like to book!"
            // extra={<Button type="primary">Next</Button>}
            />

        )

    const noData = (
        <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
                height: 60,
            }}
            description={
                <span style={{ fontSize: '22px' }}>
                    No Machines Found!
                </span>
            }
        >
        </Empty>
    )

    // if (loading) {
    //     return (
    //         <Spin tip='Loading updated machines...' size='large' />
    //     )
    // }

    const IconText = ({ icon, text }) => (
        <Space>
            {React.createElement(icon)}
            {text}
        </Space>
    );

    const items = [
        {
            key: '1',
            label: 'Nearest to Farthest',
        }
    ];

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
                                        <Spin tip='Loading...' />
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
                                        <Spin tip='Loading2...' />
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
                        <Button type="primary" onClick={fetchData} style={{ marginTop: "30px" }}>Search</Button>
                    </Col>
                    {totalPages > 0 && <Col>
                        <Select
                            placeholder="Sort By"
                            defaultActiveFirstOption
                            style={{
                                width: 170,
                                marginTop: "30px"
                            }}
                            options={[
                                { value: 'location', label: 'Nearest to Farthest' },
                            ]}
                        />
                    </Col>}

                    <Col>
                        <Button onClick={clearSearch} style={{ marginTop: "30px" }}>Clear search</Button>
                    </Col>
                </Row>
            </Form>
            <br />
            {/* Search Message */}
            {(!selectedMachineCategory || !selectedMachineType) && <>{searchData}</>}

            {/* Loading */}
            {loading && <Spin tip='Loading updated machines' size='large'><div style={{
                padding: '50px',
                background: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
            }} /></Spin>}

            {/* Display All Machines */}
            {!loading && totalPages > 0 &&
                <List
                    itemLayout="vertical"
                    size="large"
                    bordered
                    pagination={{
                        onChange: (page) => handlePageChange(page),
                        total: totalPages,
                        defaultCurrent: pages,
                        // pageSize: 3,
                    }}
                    dataSource={showAllMachines}
                    renderItem={(item, index) => (
                        <>
                            <Badge.Ribbon text={formatUpperCase(item.Category)} color='red'>
                                <List.Item
                                    style={{ background: index % 2 === 0 ? '#ffffff' : '#EEE2DE' }}
                                    key={item.CompanyName}
                                    actions={[
                                        <Button type='link' icon={<WechatOutlined />}>Chat with Supplier</Button>,
                                        <Button onClick={() => handleViewDetail(item)}>View Machine Details</Button>,
                                        <Button type="primary" onClick={() => navigate(`booking/${item.id}`)}>Book Machine</Button>,
                                    ]}
                                    extra={
                                        <img
                                            width={200}
                                            alt="machine image"
                                            // src={`https://picsum.photos/280/190?random=${item.id}`}
                                            src={item.Machine_Photo}
                                        />
                                    }
                                >
                                    <List.Item.Meta
                                        bordered={true}
                                        avatar={<Title level={5}>Machine ID: <a>{item.id}</a></Title>}
                                        title={<a>{item.CompanyName}</a>}
                                        description={<><Text strong>{formatUpperCase("Type of Machine")}:</Text>&nbsp;<span style={{ fontWeight: 'bold', color: 'blue' }}>{item.Machine_Type}</span></>}
                                    />
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Statistic title={formatUpperCase('Brand')} value={item.Brand} />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic title={formatUpperCase('Machine Hour Rate')} value={item.Machine_Hour_Rate} />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic title={formatUpperCase('Model')} value={item.Model} />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic title={formatUpperCase('Score')} value={item.Score} />
                                        </Col>
                                    </Row>
                                </List.Item>
                            </Badge.Ribbon>
                            {/* <Divider orientation="left">Small Size</Divider> */}
                        </>
                    )}
                />
            }

            {/* No Machines */}
            {totalPages == 0 &&
                <>{noData}</>
            }

            <br />
            {/* // View Details */}
            {showViewModal && <ViewMachineDetail open={open} setOpen={setOpen} machine={passData} />}
        </>
    )
}

export default HireMachines;