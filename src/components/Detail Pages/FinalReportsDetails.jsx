import { Collapse, message, Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { GET_FINAL_SAMPLE_REPORT_ORDERID_URL, GET_FIRST_SAMPLE_REPORT_ORDERID_URL } from '../../api/apiUrls';
import axios from '../../api/axios';
import { formattedDateTime } from '../../utils/utils';

function FinalReportsDetails({ order_id }) {
    const [finalReportData, setFinalReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const getFinalReportsByOrderId = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${GET_FINAL_SAMPLE_REPORT_ORDERID_URL}/${order_id}`)
            console.log("getFinalReportsByOrderId: ", response.data);
            if (response && response.data && response.data.results.length > 0) {
                setFinalReportData(response.data.results);
                setLoading(false);
            } else {
                setLoading(false);
                setFinalReportData([]);
            }
        } catch (error) {
            console.log("getFinalReportsByOrderId err: ", error);
            setLoading(false);
            message.error("Error while fetching final report!");
        }
    }

    useEffect(() => {
        getFinalReportsByOrderId();
    }, []);

    const columns = [
        {
            title: 'Sample Report ID',
            dataIndex: 'id',
            key: 'id',
            //   render: (text) => <a>{text}</a>,
        },
        {
            title: 'Part Number',
            dataIndex: 'part_number',
            key: 'part_number',
        },
        {
            title: 'Part Name',
            dataIndex: 'part_name',
            key: 'part_name',
        },
        {
            title: 'UOM',
            key: 'UOM',
            dataIndex: 'UOM',
        },
        {
            title: 'Final Product Approved Quantity',
            key: 'final_product_approved_quantity',
            dataIndex: 'final_product_approved_quantity',
        },
        {
            title: 'Final Inspection Report',
            key: 'final_inspection_report',
            dataIndex: 'final_inspection_report',
            render: (inv) => <><Link target={'_blank'} to={inv}>View Final Inspection Report</Link></>,
        },
        {
            title: 'Final Completion Date/Time',
            key: 'final_completion_date_time',
            dataIndex: 'final_completion_date_time',
            render: (date) => <>{formattedDateTime(date)}</>,
        },
        {
            title: 'Final Product Disposition',
            key: 'final_product_disposition',
            dataIndex: 'final_product_disposition',
            render: (text) => <>{text ? text.toUpperCase() : '-'}</>,
        },
        {
            title: 'Final Completion Remarks',
            key: 'final_completion_remarks',
            dataIndex: 'final_completion_remarks',
            render: (text) => <>{text ? text : '-'}</>,
        },
        {
            title: 'Final Goods Planned Pickup Date/Time',
            key: 'final_goods_planned_pickup_date_time',
            dataIndex: 'final_goods_planned_pickup_date_time',
            render: (date) => <>{formattedDateTime(date)}</>,
        },
    ];

    const collapseItems = [
        {
            key: '1',
            label: `Final Reports`,
            children: (
                <>
                    <Table columns={columns} dataSource={finalReportData} pagination={false} loading={loading} />
                </>
            ),
        }
    ]

    return (
        <>
            <>
                <h3>Lists of Final Report details:</h3>
                {finalReportData && finalReportData.length > 0
                    ? <Collapse items={collapseItems} />
                    : <h5 className='text-center'>Final report not generated</h5>
                }
            </>
        </>
    )
}

export default FinalReportsDetails;