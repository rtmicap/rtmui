import { Collapse, DatePicker, Form, Input, message, Modal, Pagination, Select, Table, Tabs, Tag } from 'antd'
import React, { useEffect, useState } from 'react'
import { ReloadOutlined } from "@ant-design/icons";
import { GET_ALL_QUOTES_URL, UPDATE_QUOTE_URL, GET_ALL_ORDERS_URL } from '../../api/apiUrls';
import axios from '../../api/axios';
import { formattedDateTime, formatUpperCase } from '../../utils/utils';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { actionButtons, actionButtons_hirer } from './QuotesUtils';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { GET_COMPANY_DETAILS_BY_ID } from '../../api/apiUrls';
import './quote.scss';
import Button from '../common/elements/ButtonElement';

const PAGE_SIZE = 10; // Number of items per page
const { confirm } = Modal;

function Quotes() {
    const { authUser } = useAuth();
    const [allQuotes, setAllQuotes] = useState([]);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [attachModal, setAttachModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null); // State for the selected quote
    const [bookingDateModalOpen, setBookingDateModalOpen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [form] = Form.useForm();
    // for filtering
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [filteredQuotes, setFilteredQuotes] = useState([]); // State for storing filtered quotes
    const [hirerCompany, setHirerCompany] = useState(null);
    const [renterCompany, setRenterCompany] = useState(null);
    const currentUserCompanyId = authUser && authUser.CompanyId;

    const navigate = useNavigate();
    // console.log("authUser: ", authUser);

    const showModal = (quote) => {
        getCompanyDetailsById(quote.hirer_company_id, setHirerCompany);
        getCompanyDetailsById(quote.renter_company_id, setRenterCompany);
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
    const getCompanyDetailsById = async (companyId, setter) => {
        try {
            const response = await axios.get(GET_COMPANY_DETAILS_BY_ID, {
                params: { companyId }
            });
            setter(response.data.data);
        } catch (error) {
            message.error("Error fetching Company Details");
        }
    };


    const getAllOrders = async (quote_id) => {
        try {
            const filteredData = allQuotes.filter((item) => item.quote_id == quote_id);
            return (filteredData[0]);
        } catch (error) {
            //navigate('/login');
            // console.log(error);
            return ({});
        }
    };

    const getAllQuotesWithoutLoading = async () => {
        try {
            const response = await axios.get(GET_ALL_QUOTES_URL);
            await response.data.result.sort((d1, d2) => {
                return new Date(d1.planned_start_date_time) - new Date(d2.planned_start_date_time);
            })
            setAllQuotes(response.data.result);
            return response.data.result;
        } catch (error) {
            setAllQuotes([]);
            message.error("Error on loading getAllQuotesWithoutLoading..");
        }
    };

    // filtered by current user and company id // please check the db for reference
    const customerQuotes = allQuotes.filter(quote => quote.renter_company_id === currentUserCompanyId);
    const myQuotes = allQuotes.filter(quote => quote.renter_company_id !== currentUserCompanyId);

    // Extract unique categories and types
    const uniqueCategories = [...new Set(allQuotes.map(quote => quote.Category))];
    const uniqueTypes = [...new Set(allQuotes.map(quote => quote.Machine_Type))];

    // Group by category and type
    const groupedQuotes = (quotes) => {
        return quotes.reduce((groups, quote) => {
            const key = `${quote.Category} - ${quote.Machine_Type}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(quote);
            return groups;
        }, {});
    };

    const myGroupedQuotes = groupedQuotes(myQuotes);
    const customerGroupedQuotes = groupedQuotes(customerQuotes);

    useEffect(() => {
        const getAllQuotes = async () => {
            try {
                setQuoteLoading(true);
                const token = localStorage.getItem('authToken');
                axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
                const response = await axios.get(GET_ALL_QUOTES_URL);
                await response.data.result.sort((d1, d2) => {
                    return new Date(d1.planned_start_date_time) - new Date(d2.planned_start_date_time);
                })
                // console.log("Quote response", response.status);
                setAllQuotes(response.data.result);
                setQuoteLoading(false);
                return response.data.result;
            } catch (error) {
                setAllQuotes([]);
                setQuoteLoading(false);
                // console.log(error);
                if (error && error.response.status == 401) {
                    message.warning("Unauthorized! Please log in again!")
                } else {
                    message.error("Error on loading quotes..");
                }
                navigate("/login");
            }
        };
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
        // console.log(key);
    };

    const handleActionChange = (value, quote) => {
        // console.log("handleActionChange: ", value);
        if (value === 'accepted' || value === 'rejected') {
            showConfirm(value, quote); // Show confirmation modal based on the selected value
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

    const handleAcceptedOrder = async (order) => {
        let orderDetails = (await getAllOrders(order));
        // console.log(orderDetails);
        if (orderDetails) {
            navigate(`/order-details/${orderDetails.order_id}`, {
                state: {
                    order: orderDetails,
                },
            });
        }
    }

    const onChangePage = (page) => {
        setCurrentPage(page); // Update current page
    };

    const acceptAndRejectQuote = async (value, quote) => {
        try {
            // setIsLoading(true);
            var reqItem = {
                quoteid: quote.quote_id,
                plannedstartdatetime: dayjs(quote.planned_start_date_time).utc().format(),
                plannedenddatetime: dayjs(quote.planned_end_date_time).utc().format(),
                machineid: quote.machine_id,
                orderprocesssheet: quote.order_process_sheet,
                orderspec: quote.order_spec,
                orderdrawing: quote.order_drawing,
                orderprogramsheet: quote.order_program_sheet,
                otherattachments: quote.other_attachments,
                quotestatus: value,
                quantity: quote.quantity,
                hirerCompanyId: quote.hirer_company_id
            }
            const response = await axios.patch(UPDATE_QUOTE_URL, (reqItem));
            message.success(`${quote.quote_id} Quote ${value}! Please visit order page for more details.`);
            // navigate('/orders', { replace: true });
            // setIsLoading(false);
            return;
        } catch (error) {
            if (error && error.response.status == 401) {
                message.warning("Unauthorized! Please log in again!")
            } else {
                message.error("Something error while accepting the quote!");
            }
            navigate("/login");
            // setIsLoading(false);
            return;
        }
    }

    const showConfirm = (value, quote) => {
        confirm({
            title: `Are you sure you want to ${value == 'accepted' ? "accept" : "reject"} this quote?`,
            content: `You have selected the option: ${value.toUpperCase()}. Please confirm your action.`,
            async onOk() {
                // Handle confirmed action here
                // console.log(`${value} confirmed`);
                await acceptAndRejectQuote(value, quote);
                getAllQuotesWithoutLoading();
            },
            onCancel() {
                // Handle cancel action here
                // console.log(`${value} canceled`);
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
                        quotestatus: 'change_request',
                        quantity: values.quantity,
                        proposedquantity: values.proposedquantity,
                        changedenddate: values.changedenddate,
                        changedstartdate: values.changedstartdate
                    }
                    const token = localStorage.getItem('authToken');
                    axios.defaults.headers.common['authorization'] = 'Bearer ' + token;

                    const response = await axios.patch(UPDATE_QUOTE_URL, reqItem);
                    message.success("Your order change request has been sent to Hirer successfully. You will get their response shortly for their acceptance!");
                    setBookingLoading(false);
                    // console.log("updateBookingDate: ", response);
                    setBookingDateModalOpen(false);
                })
                .catch(info => {
                    setBookingLoading(false);
                    // console.log('Validation Failed:', info);
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

    // Define columns for the orders table
    const columns = [
        { title: 'ID', dataIndex: 'quote_id', key: 'quote_id' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
        {
            title: 'Status', key: 'quote_status',
            render: (_, record) => (
                <>
                    {/* <p>{formatUpperCase(record.quote_status)}</p> */}
                    <Tag color={record.quote_status == 'pending' ? 'processing' : record.quote_status == 'accepted' ? 'success' : 'error'}>{record.quote_status.toUpperCase()}</Tag>
                </>
            )
        },
        {
            title: 'Date', key: 'Date',
            render: (_, record) => (
                <>
                    <div><span className="dateLabel">From: </span><div className="dateValue">{formattedDateTime(record.planned_start_date_time)}</div></div>
                    <div><span className="dateLabel">To: </span><div className="dateValue">{formattedDateTime(record.planned_end_date_time)}</div></div>
                </>
            )
        },
        {
            title: 'More Info', key: 'files',
            render: (_, record) => (
                <>
                    <Button type='link' onClick={() => showModal(record)} value={'Click here'} />
                </>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    {(record.quote_status == "accepted") ?
                        <div>
                            <Button className="orderDetailLink" type='link' onClick={() => handleAcceptedOrder(record.quote_id)} value={'Order Details'} />
                        </div> :
                        (record.hirer_company_id == authUser.CompanyId && record.quote_status == "pending") ?
                            <div>Under Review</div>
                            :
                            (record.hirer_company_id == authUser.CompanyId && record.quote_status != "pending") ?
                                <Select className="quoteAction" placeholder="-Select-" options={actionButtons_hirer} onChange={(value) => handleActionChange(value, record)} />
                                :
                                (record.renter_company_id == authUser.CompanyId && record.quote_status != "pending") ?
                                    <div>Under Review</div>
                                    :
                                    <Select className="quoteAction" placeholder="-Select-" options={actionButtons} onChange={(value) => handleActionChange(value, record)} />
                    }
                </>
            ),
        },
    ];

    // Pagination config for tables
    const paginationConfig = {
        pageSize: 10,
    };

    const handleSearch = () => {
        const filtered = allQuotes.filter(quote => {
            const categoryMatch = selectedCategory ? quote.Category === selectedCategory : true;
            const typeMatch = selectedType ? quote.Machine_Type === selectedType : true;
            return categoryMatch && typeMatch;
        });
        setFilteredQuotes(filtered);
    };

    // Group filtered quotes by category and type for display
    const groupedFilteredQuotes = groupedQuotes(filteredQuotes);

    // Render collapsible panels with tables inside
    const renderAccordion = (groupedQuotes) => (
        <Collapse accordion className="accordianSection">
            {Object.keys(groupedQuotes).map((key) => (
                <Collapse.Panel header={key} key={key}>
                    <Table className="tableSectionScroll"
                        columns={columns}
                        dataSource={groupedQuotes[key]}
                        rowKey="quote_id"
                        pagination={paginationConfig}  // Add pagination here
                    />
                </Collapse.Panel>
            ))}
        </Collapse>
    );

    return (
        <>
            <div className="container-fluid">
                <h3 className="card-title text-center">Quotes</h3>
                <div className='row'>
                    <div className="col text-end">
                        <Button type='link' onClick={refreshData} icon={<ReloadOutlined />} value={'Refresh Quotes'} />
                    </div>
                </div>

                {quoteLoading ? "Loading your Quotes..." :
                    <>

                        {/* <Collapse>
                            {Object.keys(groupedQuotes).map((key) => (
                                <Collapse.Panel header={key} key={key}>
                                    <Table
                                        columns={columns}
                                        dataSource={groupedQuotes[key]}
                                        rowKey="quote_id"
                                        pagination={false}
                                    />
                                </Collapse.Panel>
                            ))}
                        </Collapse>
                        <Pagination
                            current={currentPage}
                            pageSize={PAGE_SIZE}
                            total={allQuotes.length}
                            onChange={onChangePage} // Handle page change
                            style={{ marginTop: '16px', textAlign: 'center' }}
                        /> */}

                        <Tabs defaultActiveKey="1">
                            {/* My Quotes Tab */}
                            <Tabs.TabPane tab="My Quotes" key="1">
                                {Object.keys(myGroupedQuotes).length > 0 ? (
                                    renderAccordion(myGroupedQuotes)
                                ) : (
                                    <p>No quotes available</p>
                                )}
                            </Tabs.TabPane>

                            {/* Customer Quotes Tab */}
                            <Tabs.TabPane tab="Customer Quotes" key="2">
                                {Object.keys(customerGroupedQuotes).length > 0 ? (
                                    renderAccordion(customerGroupedQuotes)
                                ) : (
                                    <p>No customer quotes available</p>
                                )}
                            </Tabs.TabPane>

                            {/* Filtered Quotes Tab */}
                            {filteredQuotes.length > 0 && (
                                <Tabs.TabPane tab="Filtered Results" key="3">
                                    {Object.keys(groupedFilteredQuotes).length > 0 ? (
                                        renderAccordion(groupedFilteredQuotes)
                                    ) : (
                                        <p>No filtered results</p>
                                    )}
                                </Tabs.TabPane>
                            )}

                        </Tabs>
                    </>
                }

                {/* Attachments File Lists Modal */}
                {selectedQuote && (
                    <Modal
                        title={<h4 className='text-center'>More Info</h4>}
                        open={attachModal}
                        onOk={handleOk}  // Close modal on "Okay"
                        className="quoteViewModal"
                        onCancel={handleCancel}
                        footer={[
                            <Button key="ok" type="primary" onClick={handleOk} value={'Okay'} />,
                        ]}
                        width={800}
                    >
                        <div className='row'>
                            <div className="col">
                                <h6>Company Details:</h6>
                                <ul className="list-group">
                                    <li className="list-group-item">Hirer Company: <strong>{hirerCompany ? hirerCompany.companyName : "Not Available"}</strong></li>
                                    <li className="list-group-item">Office Email: <strong>{hirerCompany ? hirerCompany.offEmail : "Not Available"}</strong></li>
                                </ul>
                                <br />
                                <ul className="list-group">
                                    <li className="list-group-item">Renter Company: <strong>{renterCompany ? renterCompany.companyName : "Not Available"}</strong></li>
                                    <li className="list-group-item">Office Email: <strong>{renterCompany ? renterCompany.offEmail : "Not Available"}</strong></li>
                                </ul>

                                <hr />
                                <h6>Files:</h6>
                                <ul className="list-group">
                                    <li className="list-group-item">
                                        View Part Drawing File -&nbsp;<Link to={selectedQuote.order_drawing} target="_blank">View File</Link>
                                    </li>
                                    {selectedQuote.order_program_sheet && <li className="list-group-item">View Program Sheet File -&nbsp;<Link to={selectedQuote.order_program_sheet} target="_blank">View File</Link></li>}
                                    {selectedQuote.order_process_sheet && <li className="list-group-item">View Process Sheet File -&nbsp;<Link to={selectedQuote.order_process_sheet} target="_blank">View File</Link></li>}
                                    {selectedQuote.order_spec && <li className="list-group-item">View Specs/Standard File -&nbsp;<Link to={selectedQuote.order_spec} target="_blank">View File</Link></li>}
                                    {selectedQuote.other_attachments && <li className="list-group-item">View Others File -&nbsp;<Link to={selectedQuote.other_attachments} target="_blank">View File</Link></li>}
                                </ul>
                                <hr />
                                <h6>Comments / Planned Shipment Details:</h6>
                                <div className="quoteComment">{selectedQuote.comments ? selectedQuote.comments : 'No comments updated'}</div>
                            </div>
                            <div className="col">
                                <h6>Planned Date/Quantity:</h6>
                                <ul className="list-group">
                                    <li className="list-group-item">Planned Start Date/Time: <strong>{selectedQuote ? formattedDateTime(selectedQuote.planned_start_date_time) : "-"}</strong></li>
                                    <li className="list-group-item">Planned End Date/Time: <strong>{selectedQuote ? formattedDateTime(selectedQuote.planned_end_date_time) : "-"}</strong></li>
                                    <li className="list-group-item">Quantity: <strong>{selectedQuote.quantity}</strong></li>
                                </ul>
                                {selectedQuote.changed_start_date &&
                                    <>
                                        <h6>Changed Date/Quantity:</h6>
                                        <ul className="list-group">
                                            <li className="list-group-item">Changed Start Date/Time: <strong>{selectedQuote ? formattedDateTime(selectedQuote.changed_start_date) : "-"}</strong></li>
                                            <li className="list-group-item">Changed End Date/Time: <strong>{selectedQuote ? formattedDateTime(selectedQuote.changed_end_date) : "-"}</strong></li>
                                            <li className="list-group-item">New Quantity: <strong>{selectedQuote.proposed_quantity}</strong></li>
                                        </ul>
                                    </>
                                }
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Change Booking Dates */}
                {selectedQuote && (<Modal
                    title={`Order Date Change Request for Quote ID: ${selectedQuote.quote_id}`}
                    open={bookingDateModalOpen}
                    onCancel={handleBookingDateCancel}
                    footer={[
                        <Button key="cancel" onClick={handleBookingDateCancel} value={'Cancel'} />,
                        <Button key="update" type="primary" onClick={() => updateBookingDate(selectedQuote)} value={bookingLoading ? 'Updating...' : 'Update Change Request'} />,
                    ]}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Planned Start Date and Time"
                            name="changedstartdate"
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
                            name="changedenddate"
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
                            name="proposedquantity"
                            rules={[
                                {
                                    required: true, message: 'Please enter the proposed quantity!',
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