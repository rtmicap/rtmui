import React, { useState, useEffect } from 'react'
import HeaderTitle from '../../utils/HeaderTitle'
import { Card, Col, Row, Button, Input, Select, Space } from 'antd';
import axios from 'axios';
const { Search } = Input;
const { Meta } = Card;

function HirerDashboard() {



    return (
        <>
            <HeaderTitle title={'Dashboard'} />
            <Row gutter={16}>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Meta title="No. Of Hiring Hours" />
                        <p>156</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Meta title="No. Of Jobs completed" />
                        <p>120</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Meta title="Amount Saved" />
                        <p>100</p>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Meta title="No. Of Rental Hours" />
                        <p>156</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Meta title="No. Of Rental Jobs completed" />
                        <p>120</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Meta title="Amount Saved" />
                        <p>100</p>
                    </Card>
                </Col>
            </Row>

        </>
    )
}

export default HirerDashboard