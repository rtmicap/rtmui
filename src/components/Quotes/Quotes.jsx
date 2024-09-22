import { Button, Collapse, DatePicker, Form, Input, message, Modal, Pagination, Select, Tag } from 'antd'
import React, { useEffect, useState } from 'react'
import { ReloadOutlined } from "@ant-design/icons";
import { GET_ALL_QUOTES_URL, UPDATE_QUOTE_URL } from '../../api/apiUrls';
import axios from '../../api/axios';
import { formattedDateTime } from '../../utils/utils';
import { Link } from 'react-router-dom';
import { actionButtons } from './QuotesUtils';
import dayjs from 'dayjs';

const PAGE_SIZE = 10; // Number of items per page
const { confirm } = Modal;

function Quotes() {
    const [allQuotes, setAllQuotes] = useState([]);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [attachModal, setAttachModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null); // State for the selected quote
    const [bookingDateModalOpen, setBookingDateModalOpen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [form] = Form.useForm();

    const dummyData = [
        {
            value: 'jack',
            label: 'Jack',
        },
        {
            value: 'lucy',
            label: 'Lucy',
        },
        {
            value: 'Yiminghe',
            label: 'yiminghe',
        },
        // {
        //     value: 'disabled',
        //     label: 'Disabled',
        //     disabled: true,
        // },
    ]


    const showModal = (quote) => {
        setSelectedQuote(quote); // Set the selected quote
        setAttachModal(true); // Show the modal
    };

    const handleOk = () => {
        setAttachModal(false); // Hide the modal when "Okay" is clicked
    };

    const handleCancel = () => {
        setAttachModal(false); // Hide the modal when "Cancel" is clicked
    };

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const getAllQuotes = async () => {
        try {
            setQuoteLoading(true);
            const response = await axios.get(GET_ALL_QUOTES_URL);
            console.log("quotes: ", response.data);
            setAllQuotes(response.data.result);
            setQuoteLoading(false);
            return response.data.result;
        } catch (error) {
            console.log("error quotes: ", error);
            setAllQuotes([]);
            setQuoteLoading(false);
            message.error("Error on loading quotes..");
        }
    };

    useEffect(() => {
        getAllQuotes();
    }, [])

    // Calculate start and end indices for the current page
    const endIndex = startIndex + PAGE_SIZE;

    // Get the quotes to be displayed on the current page
    const currentQuotes = allQuotes.slice(startIndex, endIndex);

    const refreshData = () => {
        getAllQuotes();
    }

    const onChange = (key) => {
        console.log(key);
    };

    const handleActionChange = (value, quote) => {
        console.log("handleActionChange: ", value);
        if (value === 'accepted' || value === 'rejected') {
            showConfirm(value); // Show confirmation modal based on the selected value
        } else { // change booking date modal
            // set the value to specific fields
            form.setFieldsValue({
                plannedstartdatetime: dayjs(quote.planned_start_date_time).isValid() ? dayjs(quote.planned_start_date_time) : null,
                plannedenddatetime: dayjs(quote.planned_end_date_time).isValid() ? dayjs(quote.planned_end_date_time) : null,
                quantity: quote.quantity,
            });
            setBookingDateModalOpen(true);
            setSelectedQuote(quote);
        }
    }

    const items = currentQuotes.map(quote => ({
        key: quote.quote_id,
        label: `Category - Machine Type -> Quote ID: ${quote.quote_id}`,
        children: <>
            <h4>
                <Tag color={quote.quote_status == 'pending' ? 'processing' : 'error'}>{quote.quote_status.toUpperCase()}</Tag>
            </h4>
            <table class="table table-bordered table-striped">
                <tr>
                    <th>Quote ID</th>
                    <th>Quantity</th>
                    <th>Hirer Company</th>
                    <th>Planned Start Date</th>
                    <th>Planned End Date</th>
                    <th>Attachments</th>
                    <th>Action</th>
                </tr>
                <tr>
                    <td>{quote.quote_id}</td>
                    <td>{quote.quantity}</td>
                    <td>{quote.hirer_company_id}</td>
                    <td>{formattedDateTime(quote.planned_start_date_time)}</td>
                    <td>{formattedDateTime(quote.planned_end_date_time)}</td>
                    <td>
                        <Button type='link' onClick={() => showModal(quote)}>Click here</Button>
                    </td>
                    <td>
                        <Select style={{ width: '100%', height: '100%' }} placeholder="Select the option" options={actionButtons} onChange={(value) => handleActionChange(value, quote)} />
                    </td>
                </tr>
            </table>
        </>,
    }));

    const onChangePage = (page) => {
        setCurrentPage(page); // Update current page
    };

    const showConfirm = (value) => {
        confirm({
            title: `Are you sure you want to ${value} this quote?`,
            content: `You have selected the option: ${value}. Please confirm your action.`,
            onOk() {
                // Handle confirmed action here
                console.log(`${value} confirmed`);
            },
            onCancel() {
                // Handle cancel action here
                console.log(`${value} canceled`);
            },
            okText: 'Yes',
            cancelText: 'No',
        });
    };

    // Close Booking chaange date the modal
    const handleBookingDateCancel = () => {
        setBookingDateModalOpen(false);
    };


    const updateBookingDate = (selectedQuote) => {
        try {
            setBookingLoading(true);
            form.validateFields()
                .then(async values => {
                    // console.log('Updated Values:', values);
                    var reqItem = {
                        quoteid: selectedQuote.quote_id,
                        machineid: selectedQuote.machine_id,
                        hirerCompanyId: selectedQuote.hirer_company_id,
                        plannedstartdatetime: values.plannedstartdatetime ? dayjs(values.plannedstartdatetime).utc().format() : null,
                        plannedenddatetime: values.plannedenddatetime ? dayjs(values.plannedenddatetime).utc().format() : null,
                        quotestatus: 'order_date_change_requested',
                        quantity: values.quantity
                    }
                    const response = await axios.patch(UPDATE_QUOTE_URL, reqItem);
                    message.success("Your order change request has been sent to Hirer successfully. You will get their response shortly for their acceptance!");
                    setBookingLoading(false);
                    console.log("updateBookingDate: ", response);
                    setBookingDateModalOpen(false);
                })
                .catch(info => {
                    setBookingLoading(false);
                    console.log('Validation Failed:', info);
                    setBookingDateModalOpen(false);
                });
        } catch (error) {
            setBookingLoading(false);
            message.error("Order Change Request Error! Please try again!");
            setBookingDateModalOpen(false);
        }
    }

    const validateOrderQuantity = (_, value, selectedQuoted) => {
        if (value && selectedQuoted.quantity !== null && value > selectedQuoted.quantity) {
            return Promise.reject(new Error(`Quantity must not be greater than ${selectedQuoted.quantity}`));
        }
        return Promise.resolve();
    };

    return (
        <>
            <div className="container-fluid">
                <h5 class="card-title text-center">Quotes</h5>
                <br />
                <div className='row'>
                    <div className="col text-end">
                        <Button type='link' onClick={refreshData} icon={<ReloadOutlined />}>Refresh Quotes</Button>
                    </div>
                </div>
                <div className='row'>
                    <div className="col-auto">
                        <h6 style={{marginTop: '4px'}}>Filter By:</h6>
                    </div>
                    <div className='col-auto'>
                        <Select placeholder='Select the machine category' options={dummyData} />
                    </div>
                    <div className='col-auto'>
                        <Select placeholder='Select the machine type' options={dummyData} />
                    </div>
                    <div className='col-auto'>
                        <Button type='primary'>Search</Button>
                    </div>
                </div>
                <hr />
                {quoteLoading ? "Loading your Quotes..." :
                    <>
                        <Collapse
                            onChange={onChange}
                            expandIconPosition='start'
                            items={items}
                        />
                        <Pagination
                            current={currentPage}
                            pageSize={PAGE_SIZE}
                            total={allQuotes.length}
                            onChange={onChangePage} // Handle page change
                            style={{ marginTop: '16px', textAlign: 'center' }}
                        />
                    </>
                }

                {/* Attachments File Lists Modal */}
                {selectedQuote && (
                    <Modal
                        title="Attachments"
                        open={attachModal}
                        onOk={handleOk}  // Close modal on "Okay"
                        onCancel={handleCancel}
                        footer={[
                            <Button key="ok" type="primary" onClick={handleOk}>
                                Okay
                            </Button>,
                        ]}
                    >
                        <ul className="list-group">
                            <li className="list-group-item">
                                View Part Drawing File -&nbsp;<Link to={selectedQuote.order_drawing} target="_blank">View File</Link>
                            </li>
                            {selectedQuote.order_program_sheet && <li className="list-group-item">View Program Sheet File -&nbsp;<Link to={selectedQuote.order_program_sheet} target="_blank">View File</Link></li>}
                            {selectedQuote.order_process_sheet && <li className="list-group-item">View Process Sheet File -&nbsp;<Link to={selectedQuote.order_process_sheet} target="_blank">View File</Link></li>}
                            {selectedQuote.order_spec && <li className="list-group-item">View Specs/Standard File -&nbsp;<Link to={selectedQuote.order_spec} target="_blank">View File</Link></li>}
                            {selectedQuote.other_attachments && <li className="list-group-item">View Others File -&nbsp;<Link to={selectedQuote.other_attachments} target="_blank">View File</Link></li>}
                        </ul>
                    </Modal>
                )}

                {/* Change Booking Dates */}
                {selectedQuote && (<Modal
                    title={`Order Date Change Request for Quote ID: ${selectedQuote.quote_id}`}
                    open={bookingDateModalOpen}
                    onCancel={handleBookingDateCancel}
                    footer={[
                        <Button key="cancel" onClick={handleBookingDateCancel}>
                            Cancel
                        </Button>,
                        <Button key="update" type="primary" onClick={() => updateBookingDate(selectedQuote)}>
                            {bookingLoading ? 'Updating...' : 'Update Date Change'}
                        </Button>,
                    ]}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Planned Start Date and Time"
                            name="plannedstartdatetime"
                            rules={[{ required: true, message: 'Please select the start date and time!' }]}
                        >
                            <DatePicker
                                showTime={{
                                    format: 'hh:mm A',
                                    use12Hours: true,
                                }}
                                format="DD-MM-YYYY hh:mm A"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Planned End Date and Time"
                            name="plannedenddatetime"
                            rules={[{ required: true, message: 'Please select the end date and time!' }]}
                        >
                            <DatePicker
                                showTime={{
                                    format: 'hh:mm A',
                                    use12Hours: true,
                                }}
                                format="DD-MM-YYYY hh:mm A"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Quantity"
                            name="quantity"
                            rules={[
                                {
                                    required: true, message: 'Please enter the quantity!',
                                },
                                {
                                    validator: (_, value) => validateOrderQuantity(_, value, selectedQuote), // Pass selectedQuote here
                                },
                            ]}
                        >
                            <Input type="number" />
                        </Form.Item>
                    </Form>
                </Modal>)}

            </div>
        </>
    )
}

export default Quotes