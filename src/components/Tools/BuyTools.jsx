import { React, useState, useEffect } from 'react';
import samimg from "../../assets/Total_Revenue.jpg"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchTools from './SearchTools';
import { SEARCH_TOOLS,SAVE_FAVORITE} from '../../api/apiUrls';
import axios from '../../api/axios';
import "./buy.scss"
import {firstChrUpperCase} from "../../utils/utils.js";
import {message} from 'antd';


function BuyTools() {
    let favClick=false;
    let previousSearch = sessionStorage.getItem('searchParam')||null;
    previousSearch!=null?previousSearch=JSON.parse(previousSearch):"";
    const location = useLocation();
    const navigate = useNavigate();
    const [buyTools,setBuyTools]=useState([]);
    const [searchParam,setSearchParam]=useState(()=>{
        if (previousSearch!="" && previousSearch!=null){
            return previousSearch
    }else{
        return null
    }}
);
    
    const getAllTools = async () => {
        try {
            console.log(searchParam," sp");

            if(previousSearch!="" && searchParam!=null) {
                let params =typeof(searchParam)=="string"?JSON.parse(searchParam):searchParam;
                if (params.query!=""){
            const token = localStorage.getItem('authToken');
            axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
            
            const response = await axios.get(SEARCH_TOOLS, { params: params});
            if (response && response.data.results) {
                setBuyTools(response.data.results);
                return response.data.results;
            }
            }
            }
        } catch (error) {
            console.log(error);
            message.error("Error on loading orders..");
            navigate('/login');
        }
    }
    

    useEffect(() => {
        //searchParam?previousSearch=searchParam:setSearchParam(previousSearch);
        getAllTools();
        console.log(searchParam, "  buy tools");
    }, [searchParam]);
    
    const cardClick = (item) => {
        if (!favClick){
        console.log("card clicked ", item);
        favClick=false;
        navigate("/buytools-detail",{
            state: {
              toolsDetails: item,
            },
          });

        }


    }

    const handleFavClick=async(event)=>{
        favClick=true;
        try{
        const token = localStorage.getItem('authToken');
            axios.defaults.headers.common['authorization'] = 'Bearer ' + token;

            let params={tool_id:event.target.id}
            
            const response = await axios.post(SAVE_FAVORITE, params);
            if (response && response.data.results) {
                setBuyTools(response.data.results);
                return response.data.results;
            }
        } catch (error) {
            console.log(error);
            message.error("Error on adding favorites..");
        }
    }

    return (
        <div>
            <h1>Buy / Rent Tools</h1>
            <div className="container-layout">
                <div className="sidebar-filter"><div>
                    <SearchTools searchParam={searchParam} setSearchParam={setSearchParam}/></div> </div>
                <div className="main-container">
                    <div>
                    {/* <span className="detailsCardSpan">   Search Results for: </span>{previousSearch||searchParam} */}
                    </div>
                    {buyTools.map((item, index) => {
                        return (
                            <div className="inline-cardblock" key={item.tool_id} onClick={() => cardClick(item)}>
                                
                                <div className="main-card">
                                <div className={`tool_condition tool_${item.tool_condition}`}>{firstChrUpperCase(item.tool_condition)}</div>

                                <div className={`fav_tool`}>{item.favoriteInd?<input type="checkbox" id={item.tool_id} onClick={handleFavClick} defaultChecked title="Favorite"/>:<input type="checkbox" title="Favorite" id={item.tool_id} onClick={handleFavClick}/>}</div>
                                
                                <div className="card-distance">{firstChrUpperCase(item.distance)} Kms away</div>
                                    <div className="child-card-img">
                                        <img className="card-img" src={item.tool_image[0]} alt={index} />
                                    </div>
                                    <div className="card-price-tag">₹ {item.tool_selling_price}</div>
                                    <div className="card-desc"><span className="detailsCardSpan">{firstChrUpperCase(item.tool_make)}</span></div>
                                    <div className="card-desc"><span className="detailsCardSpan">{firstChrUpperCase(item.tool_name)}</span></div>
                                    
                                </div>
                            </div>)
                    })}
                </div>
            </div>
        </div>
    )
}

export default BuyTools;

