import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_TOOLS_BY_COMPANY_ID, DELETE_TOOLS } from '../../api/apiUrls.js';
import axios from '../../api/axios.js';
import "./buy.scss"
import { firstChrUpperCase } from "../../utils/utils.js";
import { message } from 'antd';

function MyTools() {
  const [myTools, setMyTools] = useState([]);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  let favClick = false;

  const getAllTools = async () => {
    try {
      const token = localStorage.getItem('authToken');
      axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
      const response = await axios.get(GET_TOOLS_BY_COMPANY_ID);
      if (response && response.data.result) {
        setMyTools(response.data.result);
      }
    } catch (error) {
      console.log(error);
      message.error("Error on loading tools..");
    }
  }

  useEffect(() => {
    getAllTools();
  }, []);

  const handleAddToolClick = () => {
    navigate('/sell-tools');
  }

  const cardClick = (item) => {
    if (!favClick) {
      console.log("card clicked ", item);
      navigate("/tools-detail", {
        state: {
          toolsDetails: item,
        },
      });
    }
  }

  const toggleDelete = (event) => {
    setIsVisible(!isVisible);
  };
  const handleDeleteClick = async(event) => {
    try {
      favClick=true;
      let tool_id=parseInt(event.target.id);
      const token = localStorage.getItem('authToken');
      axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
      const response = await axios.post(DELETE_TOOLS,{toolids:[tool_id]});
      if (response && response.data.result>0) {
        let newToolsList = myTools.filter((tool)=>{
          if (tool.tool_id!=tool_id){
            return (tool)
          };
        })
        setMyTools(newToolsList);
        message.success("Tool deleted!!");
        return;
      }else{
        message.error("Error deleting tool..");
        return;
      }
    } catch (error) {
      console.log(error);
      message.error("Error deleting tool..");
      return;
    }

  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Sell Tools</h1>
        <div className="addDelTool">
          <input type="button" className="addTool" onClick={handleAddToolClick} value="Add Tool"/>
          
          <input type="button" className="delTool" onClick={toggleDelete} value={isVisible?"Cancel Delete":"Delete Tool"}/>
        </div>
      </div>
      <div className="container-layout">
        <div className="main-container">
          <div className="grid-container">
            {myTools.length > 0 ? (
              myTools.map((item, index) => {
                return (
                  <div className="inline-cardblock" key={item.tool_id} onClick={() => cardClick(item)}>
                    <div className="main-card">
                      <div className={`tool_condition tool_${item.tool_condition}`}>{firstChrUpperCase(item.tool_condition)}</div>
                      {isVisible && <div className={`fav_tool`} id={item.tool_id} onClick={handleDeleteClick}>
                        X
                      </div>}
                      <div className="child-card-img">
                        <img className="card-img" src={item.tool_image[0]} alt={index} />
                      </div>
                      {/* <div className="card-distance">{firstChrUpperCase(item.distance)} Kms away</div> */}
                      <div className="card-price-tag">
                        <div></div>
                        <div className="prim_price_tag">Buy  : ₹ {item.tool_selling_price == null ? "NA" : item.tool_selling_price}</div>
                        <div className="sec_price_tag">Rent : ₹ {item.tool_rent_price == null ? "NA" : item.tool_rent_price}</div>
                      </div>
                      <hr />
                      <div className="card-desc"><span className="detailsCardSpan">{firstChrUpperCase(item.tool_make)}</span></div>
                      <div className="card-desc"><span className="detailsCardSpan">{firstChrUpperCase(item.tool_name)}</span></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p>No tools available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyTools;