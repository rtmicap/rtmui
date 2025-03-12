import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_TOOLS_BY_COMPANY_ID } from '../../api/apiUrls.js';
import axios from '../../api/axios.js';
import "./buy.scss"
import { firstChrUpperCase } from "../../utils/utils.js";
import { message } from 'antd';

function MyTools() {
  const [myTools, setMyTools] = useState([]);
  const navigate = useNavigate();

  const getAllTools = async () => {
    try {
      const token = localStorage.getItem('authToken');
      axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
      const response = await axios.get(GET_TOOLS_BY_COMPANY_ID);
      if (response && response.data.result) {setMyTools(response.data.result);
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
    console.log("card clicked ", item);
    navigate("/buytools-detail",{
        state: {
          toolsDetails: item,
        },
      });

}

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Sell Tools</h1>
        <button 
          style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          onClick={handleAddToolClick}
        >
          Add Tool
        </button>
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
                      <div className="child-card-img">
                        <img className="card-img" src={item.tool_image[0]} alt={index} />
                      </div>
                      <div className="card-price-tag">₹ {item.tool_selling_price}</div>
                      <div className="card-desc"><span className="detailsCardSpan">{firstChrUpperCase(item.tool_name)}</span></div>
                      <div className="card-desc">{firstChrUpperCase(item.tool_description)}</div>
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