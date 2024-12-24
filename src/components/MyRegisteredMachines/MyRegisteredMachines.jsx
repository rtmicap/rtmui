import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeftCircleOutlined } from "@ant-design/icons";
import { Button, message, Space, Table } from 'antd';
import axios from '../../api/axios';
import { GET_COMPANY_DETAILS_BY_ID, GET_MACHINES_BY_ID } from '../../api/apiUrls';

function MyRegisteredMachines() {
  const navigate = useNavigate();

  const [machinesData, setMachinesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMachinesByCompanyId = async () => {
    try {
      setLoading(true);
      const response = await axios.get(GET_MACHINES_BY_ID);
      // console.log("response: ", response.data);
      setMachinesData(response.data.result);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      // console.log("getMachinesByCompanyId err: ", error);
      message.error("Error while fetching your machines!");
    }
  }


  useEffect(() => {
    getMachinesByCompanyId();
  }, [])



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

  return (
    <>
      <div className="container">
        <h5 className='text-center'>My Registered Machines</h5>
        <hr />
        <Table columns={columns} dataSource={machinesData} />
      </div>
    </>
  )
}

export default MyRegisteredMachines