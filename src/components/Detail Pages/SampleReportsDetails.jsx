import { Collapse, Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { GET_FIRST_SAMPLE_REPORT_ORDERID_URL } from '../../api/apiUrls';
import axios from '../../api/axios';
import { firstChrUpperCase, formattedDateTime } from '../../utils/utils';

function SampleReportsDetails({ order_id }) {
    const [sampleReportData, setSampleReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const getSampleReportsByOrderId = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${GET_FIRST_SAMPLE_REPORT_ORDERID_URL}/${order_id}`)
            // console.log("reviewsampleReport: ", response.data);
            if (response && response.data && response.data.results.length > 0) {
                setLoading(false);
                setSampleReportData(response.data.results);
            } else {
                setLoading(false);
                setSampleReportData([]);
            }
        } catch (error) {
            // console.log("getSampleReportsByOrderId err: ", error);
            setLoading(false);
            message.error("Error while fetching sample report!");
        }
    }

    useEffect(() => {
        getSampleReportsByOrderId();
    }, []);
    var qty ='first_sample_quantity' + 'UOM';
    const columns = [
       /*  {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            //   render: (text) => <a>{text}</a>,
        }, */
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
            title: 'Sample Qty',
            key: 'first_sample_quantity',
            dataIndex: 'first_sample_quantity',
        },
        {
            title: 'UOM',
            key: 'UOM',
            dataIndex: 'UOM',
            render: (uom) => <>{firstChrUpperCase(uom)}</>,
        },
        {
            title: 'Inspection Report',
            key: 'first_sample_inspection_report',
            dataIndex: 'first_sample_inspection_report',
            render: (inv) => <><Link target={'_blank'} to={inv}>View</Link></>,
        },
        {
            title: 'Date/Time',
            key: 'inspection_date_time',
            dataIndex: 'inspection_date_time',
            render: (date) => <>{formattedDateTime(date)}</>,
        },
        {
            title: 'Disposition',
            key: 'first_sample_disposition',
            dataIndex: 'first_sample_disposition',
            render: (text) => <>{text ? text.toUpperCase() : '-'}</>,
        },
        {
            title: 'Remarks',
            key: 'first_sample_remarks',
            dataIndex: 'first_sample_remarks',
            render: (text) => <>{text ? text : '-'}</>,
        },
    ];

    const collapseItems = [
        {
            key: '1',
            label: `First Sample Reports`,
            children: (
                <>
                    <Table columns={columns} dataSource={sampleReportData} pagination={false} loading={loading} />
                </>
            ),
        }
    ]

    return (
        <>
            <>
                <h6>Lists of Sample Report details:</h6>
                {sampleReportData && sampleReportData.length > 0
                    ? <Collapse items={collapseItems} />
                    : <h5 className='text-center'>Sample report not generated</h5>
                }
            </>
        </>
    )
}

export default SampleReportsDetails;