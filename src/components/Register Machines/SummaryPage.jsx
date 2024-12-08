import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Input, message, Space, Table, Tag } from 'antd';
import HeaderTitle from '../../utils/HeaderTitle';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

function SummaryPage({ setOpenSummary, resetForm }) {
    const [open, setOpen] = useState(false);
    const [editedData, setEditedData] = useState(null);

    const [form] = Form.useForm();

    const [isLoading, setIsLoading] = useState(false);
    const [machines, setMachines] = useState([]);

    const REGISTER_MACHINE_URL = "/machines/registerMachine";

    const navigate = useNavigate();

    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const onEditMachine = (machine) => {
        console.log("machineId: ", machine);
        const filteredData = getAllMachines.filter((data) => data.machineId == machine.machineId);
        setEditedData(filteredData);
        console.log("filteredData: ", filteredData);
        setOpen(true);
    }

    const onRemoveMachine = (machine) => {
        console.log("machineId: ", machine);
        const filteredMachines = getAllMachines.filter((data) => data.machineId !== machine.machineId);
        console.log("filteredMachines: ", filteredMachines);
        localStorage.setItem('machines', JSON.stringify(filteredMachines));
        setMachines(filteredMachines);
    }

    const getAllMachines = JSON.parse(localStorage.getItem("machines"));
    console.log("getAllMachines: ", getAllMachines);

    useEffect(() => {
        const getAllMachines = JSON.parse(localStorage.getItem("machines"));
        setMachines(getAllMachines);
    }, [])

    const columns = [
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            render: (text) => <a>{text.toUpperCase()}</a>,
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
        },
        {
            title: 'Machine Type',
            dataIndex: 'machineType',
            key: 'machineType',
        },
        {
            title: 'Year of Purchase',
            dataIndex: 'yearOfPurchase',
            key: 'yearOfPurchase',
        },
        {
            title: 'No. Of Machines',
            dataIndex: 'noOfMachines',
            key: 'noOfMachines',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space Space size="middle" >
                    <Button block onClick={() => onEditMachine(record)} disabled>Edit</Button>
                    <Button type='primary' onClick={() => onRemoveMachine(record)} danger>Remove</Button>
                    <a>Delete {console.log("recoed: ", record)}</a>
                </Space >
            ),
        },
    ];

    const data = machines;

    const title = () => {
        return (
            <>
                <h3>Summary</h3>
            </>
        )
    }

    const onFinish = (values) => {
        console.log("onFinish: ", values);
        onSave(values);
    };

    const onSave = (valuesSaved) => {
        console.log("onSave: ", valuesSaved);
    }

    function formatString(input) {
        // Replace occurrences of '([a-z])([A-Z])' with '$1 $2'
        return input.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    const submitMachine = async () => {
        try {
            var outputArray = [];
            getAllMachines.forEach((item) => {
                if (item.noOfMachines > 1) {
                    console.log("item123: ", item);
                    for (let i = 1; i <= item.noOfMachines; i++) {
                        const machineName = `m${i}`;
                        const variableFields = Object.keys(item).reduce((acc, key) => {
                            const conditionalKeys = key !== "noOfMachines" && key !== "category" && key !== "machineType" && key !== "model" && key !== "brand" && key !== "yearOfPurchase" && key !== "machine_hour_rate" && key !== "comments" && key !== "identical" && key !== "Machine_Photo" && key !== "companyId" && key !== "id" && key !== "imageBase";
                            if (conditionalKeys) {
                                acc[key] = item[key];
                            }
                            return acc;
                        }, {});

                        const newMachine = {
                            "category": item.category,
                            "Model": item.model,
                            "machineType": formatString(item.machineType),
                            "brand": item.brand,
                            "yearOfPurchase": item.yearOfPurchase,
                            "machineHourRate": item.machineHourRate,
                            "comments": item.comments,
                            "identical": "yes",
                            "variable_fields": variableFields,
                            "companyId": item.companyId,
                            "Machine_Photo": item.Machine_Photo,
                        };

                        outputArray.push(newMachine);
                    }
                } else {
                    // console.log("item: ", item);
                    outputArray.push({
                        "category": item.category,
                        "Model": item.model,
                        "machineType": formatString(item.machineType),
                        "brand": item.brand,
                        "yearOfPurchase": item.yearOfPurchase,
                        "machineHourRate": item.machineHourRate,
                        "comments": item.comments,
                        "identical": "no",
                        "companyId": item.companyId,
                        "Machine_Photo": item.Machine_Photo,
                        ...Object.keys(item).reduce((acc, key) => {
                            const conditionalKeys = key !== "noOfMachines" && key !== "category" && key !== "machineType" && key !== "brand" && key !== "model" && key !== "yearOfPurchase" && key !== "machine_hour_rate" && key !== "comments" && key !== "identical" && key !== "Machine_Photo" && key !== "companyId" && key !== "id" && key !== "imageBase";
                            if (conditionalKeys) {
                                acc.variable_fields[key] = item[key];
                            }
                            return acc;
                        }, { variable_fields: {} })
                    });

                }
            });
            console.log("outputArray**: ", outputArray);
            // var fd = new FormData();
            // fd.append("data", JSON.stringify({ machines: outputArray }));
            const configHeaders = {
                headers: { "content-type": "application/json" },
            };

            var reqItem = {
                machines: outputArray
            }
            setIsLoading(true);
            const response = await axios.post(REGISTER_MACHINE_URL, reqItem, configHeaders);
            console.log("response 200: ", response);
            if (response && (response.status == 200 || response.status == 201)) {
                localStorage.removeItem("machines");
                // handleShowModal('success', response.data.message, 'Okay, Back to register machine!');
                console.log('Data sent successfully:', response);
                message.success(`${response.data.message}`);
                setOpenSummary(false);
                resetForm()
            } else {
                message.error(`${response.data.message}`);
            }

        } catch (error) {
            console.log('Error sending data:', error);
            // handleShowModal('error', error && error.message ? error.message : 'Something went wrong while registering the machines. Please create new machines!', 'Redirect to register machines page!');
        } finally {
            setIsLoading(false);
        }
    }

    const addMoreMachines = () => {
        setOpenSummary(false);
        resetForm();
    }


    return (
        <>
            <div style={{ textAlign: 'right' }}>
                <Button type='primary' onClick={addMoreMachines}>Add More Machines</Button>
            </div>
            <Table title={title} bordered columns={columns} dataSource={data} footer={() => data.length > 0 && <Button type='primary' onClick={submitMachine}>{isLoading ? 'Submitting' : 'Confirm & Submit'}</Button>} />
            <Drawer title="Basic Drawer" onClose={onClose} open={open}>
                {editedData && editedData.length > 0 ?
                    editedData.map((item) => {
                        console.log("title: ", item)
                        return (
                            <>
                                <Form
                                    form={form}
                                    onFinish={onFinish}
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                >
                                    <Form.Item label="Brand" name="brand" rules={[{ required: true }]}>
                                        <Input defaultValue={item.brand} />
                                    </Form.Item>
                                    <Form.Item label="Category" name="category" rules={[{ required: true }]}>
                                        <Input defaultValue={item.category} />
                                    </Form.Item>
                                    {/* Add more Form.Item for other fields */}

                                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                        <Button type="primary" htmlType="submit">
                                            Save
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </>
                        )
                    })

                    : "No Data Found"}
            </Drawer>
        </>
    )
}

export default SummaryPage