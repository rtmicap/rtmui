import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeftCircleOutlined, WechatOutlined, SearchOutlined, ReloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Badge, Button, Col, List, message, Row, Select, Space, Statistic, Table, Typography, Empty, Drawer, Tooltip } from 'antd';
import axios from '../../api/axios';
import { GET_COMPANY_DETAILS_BY_ID, GET_MACHINES_BY_ID, GET_MACHINES_BY_CAT_AND_TYPE_URL } from '../../api/apiUrls';
import ViewMachineDetail from '../Hire Machines/ViewMachineDetail';
import EditMachine from '../EditMachine/EditMachine';
const { Title, Text } = Typography;

function MyRegisteredMachines() {
  const navigate = useNavigate();

  const [machinesData, setMachinesData] = useState([]);
  const [loading, setLoading] = useState(false);
  // modal
  const [open, setOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [passData, setPassData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of items per page
  const [totalPages, setTotalPages] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [categoryAndType, setCategoryAndType] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  const handleEdit = (id, machineData) => {
    setSelectedMachineId(id);
    navigate(`edit-machine/${id}`, {
      state: {
        machineData,
      },
    });
    // setOpenDrawer(true);
  };

  const onCloseDrawer = () => {
    setOpenDrawer(false);
    setSelectedMachineId(null);
  };

  const getMachinesByCompanyId = async () => {
    try {
      setLoading(true);
      const response = await axios.get(GET_MACHINES_BY_ID);
      // console.log("response: ", response.data);
      setMachinesData(response.data.result);
      setFilteredData(response.data.result);
      setTotalPages(response.data.result.length);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("getMachinesByCompanyId err: ", error);
      message.error("Error while fetching your machines!");
    }
  }

  const getAllMachinesCategoryAndType = async () => {
    const response = await axios.get(GET_MACHINES_BY_CAT_AND_TYPE_URL);
    const machineCategories = response.data;
    // console.log("categoryNames: ", machineCategories);
    const machinesKey = Object.keys(machineCategories);
    setCategoryAndType(machineCategories);
    // console.log("machinesKey log: ", machinesKey);
    const options = machinesKey.map(category => ({
      value: category,
      label: <span>{category}</span>
    }));
    setCategories(options);
  }

  useEffect(() => {
    getAllMachinesCategoryAndType();
    getMachinesByCompanyId();
  }, []);

  // Map data to options for Select
  // const categories = [...new Set(machinesData.map(item => item.Category))];
  // const types = [...new Set(machinesData.map(item => item.Machine_Type))];

  // const categoryOptions = categories.map(category => ({ value: category, label: category }));
  // const typeOptions = types.map(type => ({ value: type, label: type }));


  const handleCategoryChange = (value) => {
    if (value) {
      const values = categoryAndType[value];
      const transformedOptions = values.map((item, index) => ({
        value: item,
        label: <span>{item}</span>,
      }));
      setMachineTypes(transformedOptions);
      setSelectedCategory(value);
    } else {
      setMachineTypes([]);
    }
  }

  const handleTypeChange = (value) => setSelectedType(value);

  const applyFilters = () => {
    let filtered = machinesData;

    if (selectedCategory) {
      filtered = filtered.filter(item => item.Category === selectedCategory);
    }
    if (selectedType) {
      filtered = filtered.filter(item => item.Machine_Type === selectedType);
    }
    setFilteredData(filtered);
  };

  const resetMachines = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    getMachinesByCompanyId();
  }


  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Machine Category',
      dataIndex: 'Category',
      key: 'Category',
    },
    {
      title: 'Machine Type',
      dataIndex: 'Machine_Type',
      key: 'Machine_Type',
    },
    {
      title: 'Brand',
      dataIndex: 'Brand',
      key: 'Brand',
    },
    {
      title: 'Model',
      dataIndex: 'Model',
      key: 'Model',
    },
    {
      title: 'Year of Purchase',
      dataIndex: 'Year_of_Purchase',
      key: 'Year_of_Purchase',
    },
    {
      title: 'Machine Hour Rate',
      dataIndex: 'Machine_Hour_Rate',
      key: 'Machine_Hour_Rate',
    },
    {
      title: 'Machine Name',
      dataIndex: 'Machine_Name',
      key: 'Machine_Name',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type='primary'>View</Button>
        </Space>
      ),
    },
  ];

  const formatUpperCase = (text) => {
    return <strong>{text.toUpperCase()}</strong>;
  }


  const handleViewDetail = (machine) => {
    // console.log("handleViewDetail: ", machine);
    setOpen(true);
    setShowViewModal(true);
    setPassData(machine);
  }

  const paginatedData = machinesData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="container">
        <h5 className='text-center'>My Registered Machines</h5>
        <hr />
        {/* <Table columns={columns} dataSource={machinesData} /> */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Space style={{ marginBottom: 16 }}>
            <Select
              placeholder="Filter by Category"
              onChange={handleCategoryChange}
              style={{ width: 200 }}
              value={selectedCategory}
              allowClear
              options={categories}
            />
            <Select
              placeholder="Filter by Machine Type"
              onChange={handleTypeChange}
              style={{ width: 200 }}
              value={selectedType}
              allowClear
              options={machineTypes}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={applyFilters}>
              Search
            </Button>
            <Button type="link" icon={<ReloadOutlined />} onClick={resetMachines}>
              Reset
            </Button>
          </Space>
        </div>
        <List
          itemLayout="vertical"
          size="large"
          bordered
          loading={loading}
          pagination={filteredData.length > 0 ? { pageSize: 10 } : false}
          dataSource={filteredData}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_DEFAULT}
                description={<Text strong>You have not registered machines.</Text>}
              />
            ),
          }}
          renderItem={(item, index) => (
            <>
              <Badge.Ribbon text={formatUpperCase(item.Category)} color='red'>
                <List.Item
                  style={{ background: index % 2 === 0 ? '#ffffff' : '#EEE2DE' }}
                  key={item.CompanyName}
                  actions={[
                    <Button onClick={() => handleViewDetail(item)}>View Machine Details</Button>,
                    <Button type="primary" danger>Block Machine</Button>,
                    <Button onClick={() => handleEdit(item.id, item)}>Edit Machine</Button>,
                  ]}
                  extra={
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "40px" }}>
                      {item.Machine_Photo?.toLowerCase().endsWith('.pdf') ? (
                        <Tooltip title="Click to View File" placement={'right'}>
                          <a href={item.Machine_Photo} target="_blank" rel="noopener noreferrer">
                            <img
                              alt="PDF file"
                              src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" // A PDF icon
                              style={{ width: '40px', height: 'auto', objectFit: 'contain' }}
                            />
                          </a>
                        </Tooltip>
                      ) : (
                        <img
                          alt="Machine Image Not Available"
                          src={item.Machine_Photo}
                          style={{ width: '200px', height: 'auto', objectFit: 'cover', borderRadius: '5px' }}
                        />
                      )}
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
        {/* // View Details */}
        {showViewModal && <ViewMachineDetail open={open} setOpen={setOpen} machine={passData} />}

        {/* Drawer for editing */}
        {/* {selectedMachineId && (
          <EditMachine machineId={selectedMachineId} onClose={onCloseDrawer} />
        )} */}
      </div>
    </>
  )
}

export default MyRegisteredMachines