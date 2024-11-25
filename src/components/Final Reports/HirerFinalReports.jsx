import { Button, Collapse, DatePicker, Flex, Form, Input, message, Modal, Select, Tooltip, Upload } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LeftCircleOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import moment from 'moment/moment';
import { GET_FINAL_SAMPLE_REPORT_ORDERID_URL, UPDATE_FINAL_REPORT_URL } from '../../api/apiUrls';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import { formattedDateTime } from '../../utils/utils';
import { finalProductStatus, uomChoices } from '../../utils/selectOptionUtils';
import FinalReportsDetails from '../Detail Pages/FinalReportsDetails';
const { TextArea } = Input;

function HirerFinalReports() {

    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewFinalReports } = location.state || {};
    const [form] = Form.useForm();

    const navigate = useNavigate();
    const currentUserCompanyId = authUser && authUser.CompanyId;

    const [sampleReportData, setFinalReportData] = useState([]);
    const [finalReportDispositionStatus, setFinalReportDispositionStatus] = useState(null);
    const [goodsPickUpDateTime, setGoodsPickUpDateTime] = useState('');


    const getFinalReportsByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_FINAL_SAMPLE_REPORT_ORDERID_URL}/${order.order_id}`)
            console.log("getFinalReportsByOrderId: ", response.data);
            if (response && response.data && response.data.results.length > 0) {
                setFinalReportData(response.data.results);
                // Sort the results array by inspection_date_time in descending order to get the latest record
                const sortedDetails = response.data.results.sort(
                    (a, b) => new Date(b.id) - new Date(a.id)
                );
                // console.log("sortedDetails: ", sortedDetails);
                const latestDetail = sortedDetails[0];
                console.log("latestDetail: ", latestDetail);
                if (latestDetail) {
                    // Set form fields based on the latest record data
                    if (authUser.CompanyId == order.hirer_company_id) {
                        form.setFieldsValue({
                            part_number: latestDetail.part_number,
                            part_name: latestDetail.part_name,
                            uom: latestDetail.UOM,
                            order_ok_quantity: latestDetail.final_product_approved_quantity,
                            completion_date_time: moment(latestDetail.final_completion_date_time),
                            final_product_disposition: latestDetail.final_product_disposition,
                            final_report_remarks: latestDetail.final_completion_remarks,
                            prod_lot_inspection_report: latestDetail.final_inspection_report,
                            final_goods_planned_pickup_datetime: moment(latestDetail.final_goods_planned_pickup_date_time),
                            final_report_id: latestDetail.id
                        });
                    }
                }
            }
        } catch (error) {
            console.log("getFinalReportsByOrderId err: ", error);
            setLoading(false);
            if (response.data.results.length!=0){
                message.error("Error while fetching final report!");
              }
        }
    }

    useEffect(() => {
        getFinalReportsByOrderId();
    }, []);


    const onFinishFailedFinalReport = (errorInfo) => {
        console.log('onFinishFailedFinalReport Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
    };

    const validateOrderQuantity = (_, value) => {
        if (value && order.quantity !== null && value > order.quantity) {
            return Promise.reject(new Error(`Quantity must not be greater than ${order.quantity}`));
        }
        return Promise.resolve();
    };

    const onOk = (value) => {
        console.log('onOk: ', value);
    };


    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    const handleStatusChange = (value) => {
        const selectedOption = finalProductStatus.find(option => option.value === value);
        const selectedLabel = selectedOption ? selectedOption.label : '';
        let content;
        if (value == "rejected") {
            content = "This action will cancel the order and cannot be reverted";
        } else {
            content = `Are you sure you want to update the ${selectedLabel} status?`;
        }
        Modal.confirm({
            title: 'Confirm Status Change',
            content: content,
            okText: 'Yes',
            cancelText: 'No',
            cancelButtonProps: { danger: true },
            onOk: () => {
                setFinalReportDispositionStatus(value);
            },
            onCancel: () => {
                console.log('Status change canceled');
            },
        });
    };

    const submitFinalReportStatus = async () => {
        try {
            const data = form.getFieldsValue();
            if (data.final_product_disposition == "pending_approval" || data.final_product_disposition == "") {
                message.info("Please update the disposition status!")
            } else {
                data.final_report_disposition = finalReportDispositionStatus;
                data.orderid = order.order_id;
                data.final_report_id = form.getFieldValue("final_report_id");
                console.log("final report datta: ", data);
                const response = await axios.patch(UPDATE_FINAL_REPORT_URL, data);
                console.log("updated submitFinalReportStatus: ", response.data);
                message.success(response.data ? response.data.message : response.message);
                navigate(-1);
            }
        } catch (error) {
            console.log("error final report: ", error);
            message.error("There is some error while updating final report!");
        }
    }

    return (
        <>
            <div>
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
                <h3 className='text-center'>Final Report</h3>
                <hr />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={submitFinalReportStatus}
                    onFinishFailed={onFinishFailedFinalReport}
                >
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col">
                                <Form.Item
                                    label="Order ID"
                                    name={'orderid'}
                                >
                                    <Tooltip title={`Cannot change Order ID.`}>
                                    <div>{order.quote_id} </div>
                                        {/* <Input placeholder="input placeholder" defaultValue={order.order_id} style={{ width: '100%' }} readOnly /> */}
                                    </Tooltip>
                                </Form.Item>
                            </div>

                            <div className="col">
                                <Form.Item label="Completion Date/Time" name={'completion_date_time'}>
                                    {form.getFieldValue('completion_date_time') ? formattedDateTime(form.getFieldValue('completion_date_time')) : "Date/Time are not updated"}
                                </Form.Item>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <Form.Item label="Part Name" required name={'part_name'} tooltip={{
                                    title: 'This is a required field'
                                }}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please update the part name!',
                                        },
                                    ]}
                                >
                                    <Input placeholder="input placeholder" style={{ width: '100%' }} />
                                </Form.Item>
                            </div>
                            <div className="col">
                                <Form.Item label="Part Number" name={'part_number'}>
                                    <Input placeholder="input placeholder" style={{ width: '100%' }} />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <Form.Item label="Order OK Quantity" required name={'order_ok_quantity'} tooltip={{
                                    title: 'This is a required field'
                                }}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please update the order OK quantity!',
                                        },
                                        {
                                            validator: validateOrderQuantity,
                                        },
                                    ]}
                                >
                                    <Input placeholder="input placeholder" style={{ width: '100%' }} />
                                </Form.Item>
                            </div>
                            <div className="col">
                                <Form.Item
                                    label="UOM"
                                    name="uom"
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please update your UOM!',
                                        },
                                    ]}
                                >
                                    <Select placeholder='Choose UOM' style={{ width: '100%' }} options={uomChoices} />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <Form.Item
                                    label="Final Product Disposition Status"
                                    name={'final_product_disposition'}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please update the status',
                                        },
                                    ]}
                                >
                                    <Select
                                        onChange={(value) => handleStatusChange(value)}
                                        options={finalProductStatus}
                                        placeholder={'Select status'}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </div>

                            <div className="col">
                                <Form.Item label="Prod Lot Inspection Report" name={'prod_lot_inspection_report'}>
                                    <Flex gap="small" wrap>
                                        {form.getFieldValue('prod_lot_inspection_report') ?
                                            <Link to={form.getFieldValue('prod_lot_inspection_report')} target={'_blank'}>View</Link>
                                            : <p style={{ color: 'red' }}>File not updated</p>}
                                    </Flex>
                                </Form.Item>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <Form.Item
                                    label="Order Completion Remarks (300 words)"
                                    name="final_report_remarks"
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your completion remarks!',
                                        },
                                    ]}
                                >
                                    <TextArea rows={3} placeholder="Enter your remarks (max: 300 words)" maxLength={300} showCount />
                                </Form.Item>
                            </div>
                            <div className="col">
                                <Form.Item label="Goods PickUp Date/Time" name={'final_goods_planned_pickup_datetime'} required tooltip={{
                                    title: 'This is a required field',
                                    // icon: <InfoCircleOutlined />,
                                }}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please choose goods pickup date/time',
                                        },
                                    ]}
                                >
                                    {form.getFieldValue('final_goods_planned_pickup_datetime')
                                        ? formattedDateTime(form.getFieldValue('final_goods_planned_pickup_datetime'))
                                        : <DatePicker
                                            disabledDate={disabledDate}
                                            showTime={{
                                                format: 'hh:mm A',
                                                use12Hours: true,
                                            }}
                                            onChange={(value, dateString) => {
                                                console.log('Selected Time: ', value);
                                                console.log('Formatted goods pick Selected Time: ', dateString);
                                                setGoodsPickUpDateTime(dateString);
                                            }}
                                            onOk={onOk}
                                        />
                                    }

                                </Form.Item>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <Button type='primary' htmlType="submit">Update</Button>
                            </div>
                        </div>
                        <hr />
                        {/* Lists of Final Reports details */}
                        <FinalReportsDetails order_id={order.order_id} />
                    </div>
                </Form>
            </div>
        </>
    )
}

export default HirerFinalReports