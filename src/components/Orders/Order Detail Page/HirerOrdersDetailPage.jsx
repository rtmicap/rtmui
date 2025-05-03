import { Descriptions, message, Space, Tag, Timeline } from 'antd';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LeftCircleOutlined } from "@ant-design/icons";
import axios from '../../../api/axios';
import { GET_COMPANY_DETAILS_BY_ID } from '../../../api/apiUrls';
import ShipmentDetails from '../../Shipment/ShipmentDetails/ShipmentDetails';
import Button from '../../common/elements/ButtonElement';

function HirerOrdersDetailPage() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order } = location.state || {};
    const navigate = useNavigate();
    const [hirerCompany, setHirerCompany] = useState(null);
    const [renterCompany, setRenterCompany] = useState(null);

    const currentUserCompanyId = authUser && authUser.CompanyId;

    const getCompanyDetailsById = async (companyId, setter) => {
        try {
            const response = await axios.get(GET_COMPANY_DETAILS_BY_ID, {
                params: { companyId }
            });
            // console.log("company details: ", response.data.data);
            setter(response.data.data);
        } catch (error) {
            if (error && error.response.status == 401) {
                message.warning("Unauthorized! Please log in again!");
                navigate("/login");
            } else {
                message.error("Error fetching Company Details");
            }
        }
    };
    var load = true;
    useEffect(() => {
        if (load) {
            getCompanyDetailsById(order.hirer_company_id, setHirerCompany);
            getCompanyDetailsById(order.renter_company_id, setRenterCompany);
            load = false;
        }
    }, []);


    if (!order) {
        return <div>No order data found!</div>;
    }
    // console.log("order: ", order);

    const items = [
        {
            label: 'ID',
            children: order.quote_id,
        },
        {
            label: 'Order Status',
            children: (
                <>
                    <Tag color={'teal'}>{order.order_status.toUpperCase()}</Tag>
                </>
            )

        },
        {
            label: 'Goods Status',
            children:
                (
                    <>
                        {(order.goods_status != "" && order.goods_status != "goods_in_return") ?
                            <div className="processFlow">
                                {order.goods_status == "goods_in_transit" ? <Tag className={order.goods_status}>{order.goods_status.toUpperCase()}</Tag> : <div className="goodsstatus">GOODS IN TRANSIT</div>}
                                {order.goods_status == "first_sample_preparation" ? <Tag className={order.goods_status}>FIRST SAMPLE PREPARATION</Tag> : <div className="goodsstatus">FIRST SAMPLE PREPARATION</div>}
                                {order.goods_status == "under_first_sample_approval" ? <Tag className={order.goods_status}>UNDER FIRST SAMPLE APPROVAL</Tag> : <div className="goodsstatus">UNDER FIRST SAMPLE APPROVAL</div>}
                                {order.goods_status == "first_sample_repeat" ? <Tag className={order.goods_status}>FIRST SAMPLE REPEAT</Tag> : <div className="goodsstatus">FIRST SAMPLE REPEAT</div>}
                                {order.goods_status == "production_in_progress" ? <Tag className={order.goods_status}>PRODUCTION IN PROGRESS</Tag> : <div className="goodsstatus">PRODUCTION IN PROGRESS</div>}
                                {order.goods_status == "production_complete" ? <Tag className={order.goods_status}>PRODUCTION COMPLETE</Tag> : <div className="goodsstatus">PRODUCTION COMPLETE</div>}
                            </div>
                            :
                            order.goods_status == "goods_in_return" ? <div className="processFlow"><Tag className={order.goods_status}>GOODS IN RETURN</Tag></div>
                                :
                                <div className="goodsstatus">SHIPMENT PENDING</div>
                        }
                    </>
                )

        },
        {
            label: 'Order Quantity',
            children: order.quantity,
        },
        {
            label: 'Planned Hours',
            children: order.planned_hours,
        },
        {
            label: 'Actual Hours',
            children: order.actual_hours,
        },
        {
            label: 'Hirer Company ID',
            children: (
                <>
                    <span>{hirerCompany ? `${hirerCompany.companyName} (${order.hirer_company_id})` : '-'}</span>
                </>
            ),
        },
        {
            label: 'Hirer Email ID',
            children: (
                <>
                    <span>{hirerCompany ? `${hirerCompany.factoryEmail}` : '-'}</span>
                </>
            ),
        },
        {
            label: 'Renter Company ID',
            children: (
                <>
                    <>
                        <span>{renterCompany ? `${renterCompany.companyName} (${order.renter_company_id})` : '-'}</span>
                    </>
                </>
            ),
        },
        {
            label: 'Renter Email ID',
            children: (
                <>
                    <>
                        <span>{renterCompany ? `${renterCompany.factoryEmail}` : '-'}</span>
                    </>
                </>
            ),
        },
    ];

    // const handleShipmentRedirect = () => {
    //     navigate("order-details/:orderId/shipment-details")
    // }

    const handleShipmentRedirect = (record, value) => {

        navigate(`/order-details/${record.order_id}/shipment-details`, {
            state: {
                order: record,
                reviewShipment: value == "reviewMaterials" ? true : false
            },
        });
    };

    const handleSampleReportRedirect = (record, value) => {
        let goods_status = ["goods_in_transit", "first_sample_preparation"];
        if (record.goods_status != "" && goods_status.indexOf(record.goods_status) == -1) {
            navigate(`/order-details/${record.order_id}/sample-report`, {
                state: {
                    order: record,
                    reviewSampleReports: value == "reviewSampleReports" ? true : false
                },
            });
        }
        else {
            message.destroy();
            message.error("First sample report is pending")
        }
    };

    const handleFinalReportRedirect = (record, value) => {
        let goods_status = ["production_complete"];
        if (goods_status.indexOf(record.goods_status) > -1) {
            navigate(`/order-details/${record.order_id}/final-report`, {
                state: {
                    order: record,
                    reviewFinalReports: value == "reviewFinalReports" ? true : false
                },
            });
        }
        else {
            message.destroy();
            message.error("Final Report is pending")
        }
    };

    return (
        <>
            <div className="container">
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)} value={'Back'} />
                <h3 className='text-center'>Order Details</h3>
                <hr />
                <Descriptions
                    // title="Order Descriptions"
                    bordered
                    column={{
                        xs: 1,
                        sm: 2,
                        md: 2,
                        lg: 2,
                        xl: 2,
                        xxl: 2,
                    }}
                    items={items}
                />

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Space>
                        <Button type='button' className="btn btn-primary btn-sm" onClick={() => handleShipmentRedirect(order, 'shipMaterials')}
                            value={'Ship Materials To Renter'} />

                        {/* Sample Reports */}
                        <Button type='button' className="btn btn-warning btn-sm" onClick={() => handleSampleReportRedirect(order, 'reviewSampleReports')}
                            value={'Review Sample Report'} />

                        {/* Final Reports */}
                        <Button type='button' className="btn btn-dark btn-sm" onClick={() => handleFinalReportRedirect(order, 'reviewFinalReports')}
                            value={'Review Final Report'} />
                    </Space>
                </div>
                {/* Lists of shipment details */}
                {/* <ShipmentDetails order_id={order.order_id} /> */}
            </div>
        </>
    )
}

export default HirerOrdersDetailPage
