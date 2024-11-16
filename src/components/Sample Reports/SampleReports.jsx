import { Button, Collapse, message } from 'antd';
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LeftCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from 'react';
import { GET_FIRST_SAMPLE_REPORT_ORDERID_URL } from '../../api/apiUrls';
import axios from '../../api/axios';
import { formattedDateTime } from '../../utils/utils';
import moment from 'moment/moment';
import HirerSampleReports from './HirerSampleReports';
import RenterSampleReports from './RenterSampleReports';

function SampleReports() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewSampleReports } = location.state || {};
    const navigate = useNavigate();

    const [sampleReportData, setSampleReportData] = useState([]);

    const currentUserCompanyId = authUser && authUser.CompanyId;

    const getSampleReportsByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_FIRST_SAMPLE_REPORT_ORDERID_URL}/${order.order_id}`)
            // console.log("reviewsampleReport: ", response.data);
            if (response && response.data && response.data.results.length > 0) {
                setSampleReportData(response.data.results);
            }
        } catch (error) {
            console.log("getSampleReportsByOrderId err: ", error);
            message.error("Error while fetching sample report!");
        }
    }

    useEffect(() => {
        getSampleReportsByOrderId();
    }, []);

    const collapseItems = sampleReportData.map((item, index) => ({
        key: item.id,
        label: `Part Number: ${item.part_number} (${item.part_name})`,
        children: (
            <div className='row'>
                <div className="col">
                    <p><strong>Quantity:</strong> {item.first_sample_quantity}</p>
                    <p><strong>UOM:</strong> {item.UOM}</p>
                    <p><strong>Inspection Date:</strong> {formattedDateTime(item.inspection_date_time)}</p>
                    <p><strong>Disposition:</strong> {item.first_sample_disposition}</p>
                    <p><strong>Report:</strong> <a href={item.first_sample_inspection_report} target="_blank" rel="noopener noreferrer">View Report</a></p>
                    {item.first_sample_remarks && (
                        <p><strong>Remarks:</strong> {item.first_sample_remarks}</p>
                    )}
                </div>
            </div>
        ),
    }));

    return (
        <>
            <div className="container">
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
                <h5 className='text-center'>Sample Report for Order ID: {order.order_id}</h5>
                <hr />
                {authUser && currentUserCompanyId == order.hirer_company_id ?
                    <HirerSampleReports />
                    : authUser && currentUserCompanyId == order.renter_company_id ?
                        <RenterSampleReports />
                        : <h4 className='text-center'>Something went wrong</h4>
                }
                {/* Lists of sample Reports */}
                {sampleReportData && sampleReportData.length > 0 && (authUser && authUser.CompanyId == order.renter_company_id) &&
                    <>
                        <hr />
                        <h6>Lists of updated sample reports:</h6>
                        <Collapse items={collapseItems} />
                    </>
                }
            </div>

        </>
    )
}

export default SampleReports