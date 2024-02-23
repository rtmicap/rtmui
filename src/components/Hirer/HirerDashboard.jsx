import React from 'react'
import HeaderTitle from '../../utils/HeaderTitle'
import { Card, Col, Row, Button, Input, Select, Space } from 'antd';
const { Search } = Input;

function HirerDashboard() {
    return (
        <>
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
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Card title="Card title" bordered={false}>
                        Card content
                    </Card>
                    <Button type="primary">Book</Button>
                </Col>
                <Col span={8}>
                    <Card title="Card title" bordered={false}>
                        Card content
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Card title" bordered={false}>
                        Card content
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Card title="Card title" bordered={false}>
                        Card content
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Card title" bordered={false}>
                        Card content
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Card title" bordered={false}>
                        Card content
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default HirerDashboard