import React, { useState, useEffect, useId } from 'react'
import HeaderTitle from '../../utils/HeaderTitle';
import { Card, Col, Row, Button, Input, Space, Select, Statistic, Spin, Form, Modal, Badge, Dropdown, message, Result, Empty, Divider, Typography, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import ViewMachineDetail from './ViewMachineDetail';
const { Search } = Input;
const { Meta } = Card;
const { Option } = Select;
import Config from '../../env.json'
import { useAuth } from '../../contexts/AuthContext';
import { FileSearchOutlined, WechatOutlined, FilePdfOutlined } from '@ant-design/icons';
import { LikeOutlined, MessageOutlined, DownOutlined } from '@ant-design/icons';
import { Avatar, List } from 'antd';
import "./style.scss";
import axios from '../../api/axios';

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
    const SEARCH_MACHINES = "/booking/searchMachines";
    const GET_MACHINE_CAT_TYPE = "/machines/getMachinesByCatAndType";
    const GET_ALL_MACHINES = "/machines/getAllMachines";

    const fetchData = async (pages) => {
        try {
            setLoading(true);
            // query parameters
            const queryParams = {
                category: selectedMachineCategory,
                machineType: selectedMachineType,
                page: pages
            };

            const response = await axios.get(SEARCH_MACHINES, {
                params: queryParams,
            });

            // Handle the response data
            setShowAllMachines(response.data.paginatedResults);
            setPages(response.data.page);
            setPageSize(response.data.pageSize);
            setTotalPages(response.data.totalItems);
            message.success(response.data.message);
            setLoading(false);
            // console.log('Response data:', response.data);
        } catch (error) {
            // Handle errors
            setLoading(false);
            message.error("There is some error while searching the machine!", error.message);
            //console.error('Error fetching data:', error);
            navigate("/login");
        }
    };

    const getAllMachinesCategoryAndType = async () => {
        try {
            const response = await axios.get(GET_MACHINE_CAT_TYPE);
            const machineCategories = response.data;
            // console.log("categoryNames: ", machineCategories);
            const machinesKey = Object.keys(machineCategories);
            setCategoryAndType(machineCategories);
            const options = machinesKey.map(category => ({
                value: category,
                label: <span>{category}</span>
            }));
            setCategories(options);
            // console.log("machinesKey log: ", machinesKey);
            // console.log("options: ", options);
        } catch (error) {
            // Handle errors
            // console.error('Error getAllMachinesCategory data:', error);
        }
    }

    const getAllMachines = async (pages) => {
        try {
            setLoading(true);
            const params = {
                page: pages,
            };
            const machinesData = await axios.get(GET_ALL_MACHINES, { params });
            setShowAllMachines(machinesData.data.paginatedResults);
            setPages(machinesData.data.page);
            setPageSize(machinesData.data.pageSize);
            setTotalPages(machinesData.data.totalItems);
            message.success(machinesData.data.message);
            setLoading(false);
            // console.log("all machinesData: ", machinesData);
        } catch (error) {
            // Handle errors
            setLoading(false);
            message.error("There is some error!", error.message);
            // console.error('Error machinesData data:', error);
        }
    }

    const handleCategoryChange = (value) => {
        setCategoryValue(value);
        if (value) {
            const values = categoryAndType[value];
            const transformedOptions = values.map((item, index) => ({
                value: item,
                label: <span>{item}</span>,
            }));
            setMachineTypes(transformedOptions);
            // setMachineTypes(values);
            // console.log("setMachineTypes: ", values);
            setSelectedMachineCategory(value);
        } else {
            setMachineTypes([]);
        }
    };

    const handleTypeChange = (value) => {
        // console.log("handleTypeChange", value);
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
        // console.log("handleViewDetail: ", machine);
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
        // console.log("onShowSizeChange:", current, pageSize);
    };

    const handlePageChange = (page, pageSize) => {
        setPages(page);
        if (selectedMachineType && selectedMachineCategory) {
            fetchData(page);
        } else {
            // alert("get all");
            getAllMachines(page);
        }
        // console.log("handlePageChange:", page, pageSize);
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
            <div className="container-fluid">
                <div>
                    <HeaderTitle title={'Hire a Machine'} />
                </div>
                <Form form={form} layout='vertical'>
                    <div className="row">
                        <div className="col-auto">
                            <Form.Item
                                name='categoryInput'
                                label="Choose Machine Category"
                                rules={[{ required: true, message: "You must choose the machine category" }]}
                            >
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select Category"
                                    onChange={handleCategoryChange}
                                    options={categories}
                                />
                                {/* {
                                        categories.map((item, index) => (
                                            <Select.Option key={item} value={item}>
                                                {item}
                                            </Select.Option>
                                        ))
                                    }
                                </Select> */}
                            </Form.Item>
                        </div>
                        <div className="col-auto">
                            <Form.Item
                                name='typeInput'
                                label="Choose Machine Type"
                                rules={[{ required: true, message: "You must choose the machine type" }]}
                            >
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select Type"
                                    onChange={handleTypeChange}
                                    options={machineTypes}
                                />
                            </Form.Item>
                        </div>
                        {!loading && totalPages > 0 &&
                            <div className='col-auto'>
                                <Select
                                    placeholder="Sort By"
                                    defaultActiveFirstOption
                                    defaultValue={'Nearest to Farthest'}
                                    style={{
                                        width: '100%',
                                        marginTop: "30px"
                                    }}
                                    options={[
                                        { value: 'location', label: 'Nearest to Farthest' },
                                    ]}
                                />
                            </div>}

                        <div className="col-auto">
                            <Button style={{ marginTop: '30px' }} onClick={clearSearch}>Clear Search</Button>
                        </div>
                        <div className="col-auto">
                            <Button type='primary' onClick={fetchData} style={{ marginTop: '30px' }}>Submit</Button>
                        </div>
                    </div>
                    <Divider />

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
                                                <Button type="primary" onClick={() => navigate(`book-machine/${item.id}`)}>Book Machine</Button>,
                                            ]}
                                            extra={
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    {item.Machine_Photo?.toLowerCase().endsWith('.pdf') ? (
                                                        <a href={item.Machine_Photo} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                alt="PDF file"
                                                                src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" // A PDF icon
                                                                style={{ width: '40px', height: 'auto', objectFit: 'contain' }}
                                                            />
                                                            <Title level={5} style={{ marginTop: '8px', textAlign: 'center' }}>
                                                                <span style={{color: 'blue'}}>View File</span> <FilePdfOutlined style={{ color: 'red' }} />
                                                            </Title>
                                                        </a>
                                                    ) : (
                                                        <img
                                                            alt="machine image"
                                                            src={item.Machine_Photo}
                                                            style={{ width: '200px', height: 'auto', objectFit: 'cover', borderRadius: '5px' }}
                                                        />
                                                    )}
                                                    <Title level={5} style={{ marginTop: '8px', textAlign: 'center' }}>
                                                        Distance(Kms): <a>{item.distance ? item.distance : '-'}</a>
                                                    </Title>
                                                </div>
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

                </Form>
                {/* // View Details */}
                {showViewModal && <ViewMachineDetail open={open} setOpen={setOpen} machine={passData} />}
            </div>
        </>
    )
}

export default HireMachines;