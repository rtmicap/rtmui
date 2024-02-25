import React, { useState, useEffect } from 'react'
import HeaderTitle from '../../utils/HeaderTitle';
import { Card, Col, Row, Button, Input, Select, Space } from 'antd';
import axios from 'axios';
const { Search } = Input;
const { Meta } = Card;

function HireMachines() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const getAllUsers = async () => {
        try {
            const usersData = await axios.get("https://jsonplaceholder.typicode.com/users");
            console.log("usersData: ", usersData);
            setUsers(usersData.data)
            setTotalPages(Math.ceil(response.headers['x-total-count'] / 10));
        } catch (error) {
            console.error('Error fetching users:', error);
        }

    }

    useEffect(() => {
        getAllUsers();
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
                    <Input placeholder='Search your machines...' />
                    <Button type="primary">Search</Button>
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