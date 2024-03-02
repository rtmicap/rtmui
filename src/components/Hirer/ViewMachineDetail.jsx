import { Modal } from 'antd'
import React from 'react'

function ViewMachineDetail({ open, setOpen, machine }) {
    console.log("view modal: ", machine);
    return (
        <>
            <Modal
                title="Modal 1000px width"
                centered
                open={open}
                onOk={() => setOpen(false)}
                // onCancel={() => setOpen(false)}
                width={1000}
            >
                <p>some contents...</p>
                <p>some contents...</p>
                <p>some contents...</p>
            </Modal>
        </>
    )
}

export default ViewMachineDetail