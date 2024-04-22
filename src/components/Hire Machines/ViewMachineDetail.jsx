import { Button, Descriptions, Modal } from 'antd'
import React from 'react'

function ViewMachineDetail({ open, setOpen, machine }) {
    console.log("view modal: ", machine);

    function formatString(input) {
        // Replace occurrences of '([a-z])([A-Z])' with '$1 $2'
        // Ex: BandSaw -> Band Saw or ConventionalLathe -> Conventional Lathe
        return input.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    function formatVariableFieldsString(str) {
        return str
            .split('_')                // Split the string by underscores
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize the first letter of each word
            .join(' ');                // Join the words back into a string with spaces
    }

    const items = [
        {
            label: 'Machine Name',
            children: machine.Machine_Name,
        },
        {
            label: 'Category',
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: machine.Category.toUpperCase(),
        },
        {
            label: 'Machine Type',
            children: formatString(machine.Machine_Type),
        },
        {
            label: 'Brand',
            children: machine.Brand,
        },
        {
            label: 'Model',
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: machine.Model,
        },
        {
            label: 'Machine Hour Rate',
            children: machine.Machine_Hour_Rate,
        },
        {
            label: 'Year of Purchase',
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: machine.Year_of_Purchase,
        },
        {
            label: 'Score',
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: machine.Score,
        },
        {
            label: 'Machine Photo',
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: (
                // <img alt="example" src={`https://picsum.photos/250/200?random=${machine.id}`} />
                <img alt="Machine Image" src={machine.Machine_Photo} />
            ),
        },
        {
            label: 'Other Details',
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: (
                <>
                    <ul style={{ listStyle: 'none' }}>
                        {Object.keys(machine.Variable_fields).map((key, index) => {
                            return (
                                <li key={index}>{formatVariableFieldsString(key)}-&nbsp;&nbsp;<strong>{machine.Variable_fields[key]}</strong></li>
                            )
                        })}
                    </ul>
                </>
            )
        },
    ];


    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);
    };

    return (
        <>
            <Modal
                title={machine.Machine_Name}
                centered
                open={open}
                width={1300}
                footer={[
                    <Button type='primary' onClick={handleOk}>
                        Okay
                    </Button>
                ]}
                // onOk={handleOk}
                onCancel={() => { setOpen(false) }}
            >
                <Descriptions
                    // title="Responsive Descriptions"
                    bordered
                    column={{
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 3,
                        xl: 4,
                        xxl: 4,
                    }}
                    items={items}
                />
            </Modal>
        </>
    )
}

export default ViewMachineDetail