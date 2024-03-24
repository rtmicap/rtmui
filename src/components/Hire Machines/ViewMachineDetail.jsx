import { Button, Modal } from 'antd'
import React from 'react'

function ViewMachineDetail({ open, setOpen, machine }) {
    console.log("view modal: ", machine);
    return (
        <>
            <Modal
                title="Modal 1000px width"
                centered
                open={open}
                width={1000}
                footer={[
                    <Button type='primary' onClick={() => setOpen(false)}>
                        Okay
                    </Button>
                ]}
            >
                <p>some contents...</p>
                <p>some contents...</p>
                <p>some contents...</p>
            </Modal>
        </>
    )
}

export default ViewMachineDetail