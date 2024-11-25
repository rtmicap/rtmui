import { Button, Collapse, DatePicker, Flex, Form, Input, message, Select, Tooltip, Upload } from 'antd';
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LeftCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { CREATE_FINAL_REPORT_URL, FILE_UPLOAD_URL, GET_FINAL_SAMPLE_REPORT_ORDERID_URL, UPDATE_FINAL_REPORT_URL } from '../../api/apiUrls';
import dayjs from 'dayjs';
import moment from 'moment/moment';
import { formattedDateTime } from '../../utils/utils';
import HirerFinalReports from './HirerFinalReports';
import RenterFinalReports from './RenterFinalReports';
import './finalReport.scss'
const { TextArea } = Input;

function FinalReports() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewFinalReports } = location.state || {};
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const currentUserCompanyId = authUser && authUser.CompanyId;

    const [finalReportDispositionStatus, setFinalReportDispositionStatus] = useState(null);
    const [sampleReportData, setFinalReportData] = useState([]);
    const [goodsPickUpDateTime, setGoodsPickUpDateTime] = useState('');
    const [prodInspectionReportFileList, setProdInspectionReportFileList] = useState([]);
    const [viewProdLotInspectionReportFile, setViewProdLotInspectionReportFile] = useState('');
    const [fileFinalReportLoading, setFileFinalReportLoading] = useState(false);
    const [orderCompletionDateTime, setOrderCompletionDateTime] = useState('');

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    const getFinalReportsByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_FINAL_SAMPLE_REPORT_ORDERID_URL}/${order.order_id}`)
            console.log("getFinalReportsByOrderId: ", response.data);
            if (response && response.data && response.data.results.length > 0) {
                setFinalReportData(response.data.results);
                // Sort the results array by inspection_date_time in descending order to get the latest record
                const sortedDetails = response.data.results.sort(
                    (a, b) => new Date(a.final_completion_date_time) - new Date(b.final_completion_date_time)
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
                            final_completion_remarks: latestDetail.final_completion_remarks,
                            prod_lot_inspection_report: latestDetail.final_inspection_report,
                            final_report_id: latestDetail.id
                        });
                    }
                }
            }
        } catch (error) {
            console.log("getFinalReportsByOrderId err: ", error);
            setLoading(false);
            if (response.data.results.length==0){
                
            }
            else{
              message.error("Error while fetching final report!");
            }
        }
    }

    useEffect(() => {
        getFinalReportsByOrderId();
    }, []);

    const handleFinalReportSubmit = async (values) => {
        if (reviewFinalReports && finalReportDispositionStatus) {
            submitFinalReportStatus(finalReportDispositionStatus);
        } else {
            onFinishFinalReport(values);
        }
    }

    const onFinishFinalReport = async (values) => {
        const data = form.getFieldsValue();
        console.log("get Data: ", data);
        values.orderid = order.order_id;
        values.final_goods_planned_pickup_datetime = goodsPickUpDateTime;
        values.completion_date_time = orderCompletionDateTime;
        values.prod_lot_inspection_report = viewProdLotInspectionReportFile;
        values.final_product_disposition = "pending_approval";
        values.first_sample_id = form.getFieldValue("first_sample_id");
        console.log('onFinishFinalReport:', values);
        const response = await axios.post(CREATE_FINAL_REPORT_URL, values);
        message.success(`${response.data.message}`);
        navigate(-1);
    }

    const submitFinalReportStatus = async (value) => {
        try {
            const data = form.getFieldsValue();
            data.final_product_disposition = value;
            data.orderid = order.order_id;
            data.final_report_id = form.getFieldValue("final_report_id");
            console.log("final report datta: ", data);
            const response = await axios.patch(UPDATE_FINAL_REPORT_URL, data);
            console.log("updated submitFinalReportStatus: ", response.data);
            message.success(response.data ? response.data.message : response.message);
            navigate(-1);
        } catch (error) {
            console.log("error final report: ", error);
            message.error("There is some error in final report!");
        }
    }

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

    const fileUpload = async (file) => {
        try {
            const configHeaders = {
                headers: { "content-type": "multipart/form-data" },
            };
            const formData = new FormData();
            formData.append("fileName", file.originFileObj);
            var response = await axios.post(FILE_UPLOAD_URL, formData, configHeaders);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    const handleProdLotInspectionReportFileChange = async (info) => {
        let fileList = [...info.fileList];
        // Limit to only one file
        fileList = fileList.slice(-1);
        // console.log("size: ", fileList[0].size / 1024 / 1024 < 2);
        // Display an error message if more than one file is uploaded
        if (fileList.length > 1) {
            message.error('You can only upload one file');
        } else {
            setProdInspectionReportFileList(fileList);
            if (fileList[0].size / 1024 / 1024 < 3) { // upto 3 MB upload size
                setFileFinalReportLoading(true);
                // update file upload api
                const fileRes = await fileUpload(fileList[0]);
                // console.log("fileRes: ", fileRes);
                message.success("Final Inspection Report File Uploaded!")
                setViewProdLotInspectionReportFile(fileRes.fileUrl);
                setFileFinalReportLoading(false);
            } else {
                message.error('File size must less than 3 MB');
            }
        }
    }

    const handleProdLotInspectionReportRemove = () => {
        setProdInspectionReportFileList([]);
        setViewProdLotInspectionReportFile('');
    };

    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    return (
        <>
            <div className="container">
                {authUser && currentUserCompanyId == order.hirer_company_id ?
                    <HirerFinalReports />
                    : authUser && currentUserCompanyId == order.renter_company_id ?
                        <RenterFinalReports />
                        : <h4 className='text-center'>Something went wrong</h4>
                }
            </div>
        </>
    )
}

export default FinalReports