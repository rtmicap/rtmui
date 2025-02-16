import React from 'react'
import "./buy.scss"
import samimg from "../../assets/Total_Revenue.jpg"

function BuyTools_main() {
    const buyTools = 
        [
        {
            id:0,
            img: "",
            price: 120.99,
            description: "Drill Bit set"
        },
        {
            id:1,
            img: "",
            price: 121.99,
            description: "Cutting band saw"
        },
        {
            id:2,
            img: "",
            price: 122.99,
            description: "Turnning mill"
        },
        {
            id:3,
            img: "",
            price: 123.99,
            description: "Turnning mill"
        },
        {
            id:3,
            img: "",
            price: 123.99,
            description: "Turnning mill"
        }
        ]
    const cardClick=(index)=>{
        console.log("card clicked ",index);
    }

    return (
        <div>
            <h1>BuyTools</h1>
            <div className="container-layout">
            <div className="sidebar-filter">Search/Filter</div>
            <div className="main-container">
                {buyTools.map((item,index)=>{
                  return(
                <div className="inline-cardblock" id={item.id} onClick={()=>cardClick(item.id)}>
                    <div className="main-card">
                        <div className="child-card-img">
                            <img className="card-img" src={samimg} alt={index} />
                        </div>
                        <div className="card-price-tag">${item.price}</div>
                        <div className="card-desc">{item.description}</div>
                    </div>
                </div>)
            })}
            </div>
            </div>
        </div>
    )
}

export default BuyTools_main;