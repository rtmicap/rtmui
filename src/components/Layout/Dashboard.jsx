import React from 'react'
import HeaderTitle from '../../utils/HeaderTitle'

function Dashboard() {
    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <HeaderTitle title={'Dashboard'} />
                </div>

                <div className='row'>
                    <div className="col-sm-6 col-lg-3">
                        <div className="card text-center">
                            <div className="card-header">
                                Featured
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">Special title</h5>
                                <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                                <a href="#" className="btn btn-primary">Go somewhere</a>
                            </div>
                            <div className="card-footer text-body-secondary">
                                2 days ago
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="card text-center">
                            <div className="card-header">
                                Featured
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">Special title</h5>
                                <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                                <a href="#" className="btn btn-primary">Go somewhere</a>
                            </div>
                            <div className="card-footer text-body-secondary">
                                2 days ago
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        Three
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        Three
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        Three
                    </div>
                </div>
                <div className='row'>
                    <div className="col-sm-6 col-lg-3">
                        Two
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="card border-success mb-3" style={{ maxWidth: '18rem' }}>
                            <div className="card-header">Header</div>
                            <div className="card-body text-success">
                                <h5 className="card-title">Success card title</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="card border-warning mb-3" style={{ maxWidth: '18rem' }}>
                            <div className="card-header">Header</div>
                            <div className="card-body text-warning">
                                <h5 className="card-title">Success card title</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Dashboard