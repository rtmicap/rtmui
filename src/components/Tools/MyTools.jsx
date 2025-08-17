import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GET_TOOLS_BY_COMPANY_ID, DELETE_TOOLS } from '../../api/apiUrls.js';
import axios from '../../api/axios.js';
import "./buy.scss"
import { firstChrUpperCase } from "../../utils/utils.js";
import deleteIcon from "../../assets/delete.svg";
import { message } from 'antd';
import BUTTON from '../common/elements/ButtonElement';

function MyTools() {
  const [myTools, setMyTools] = useState([]);
  let previousSearch = sessionStorage.getItem('searchParam') || null;
  const [pageName, setPageName] = useState(JSON.parse(previousSearch).category);
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  let favClick = false;
  let location = useLocation();

  const [filterText, setFilterText] = useState('');

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };



  const getAllTools = async () => {
    try {
      const token = localStorage.getItem('authToken');
      let filterCategory = (JSON.parse(sessionStorage.getItem('searchParam')).category).toLowerCase();
      axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
      const response = await axios.get(GET_TOOLS_BY_COMPANY_ID);
      if (response && response.data.result) {
        console.log(response.data.result);
        let filteredList = (response.data.result).filter((tool) => {
          if (tool.category == filterCategory) {
            console.log(tool.category);
            return (tool)
          };
        })
        console.log(filteredList)
        setMyTools(filteredList);
      }
    } catch (error) {
      console.log(error);
      message.error("Error on loading tools..");
    }
  }

  useEffect(() => {
    getAllTools();
  }, [location.pathname])

  const handleAddToolClick = () => {
    navigate('/sell-tools');
  }

  const cardClick = (item) => {
    if (!favClick) {
      console.log("card clicked ", item);
      navigate(`/tools-detail/?toolid=${item.tool_id}`, {
        state: {
          toolsDetails: item,
          transType: 'sell'
        },
      });
    }
  }

  const toggleDelete = (event) => {
    setIsDelete(!isDelete);
  };
  const handleDeleteClick = async (event) => {
    try {
      favClick = true;
      let tool_id = parseInt(event.target.id);
      const token = localStorage.getItem('authToken');
      axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
      const response = await axios.post(DELETE_TOOLS, { toolids: [tool_id] });
      if (response && response.data.result > 0) {
        let newToolsList = myTools.filter((tool) => {
          if (tool.tool_id != tool_id) {
            return (tool)
          };
        })
        setMyTools(newToolsList);
        message.success("Tool deleted!!");
        return;
      } else {
        message.error("Error deleting tool..");
        return;
      }
    } catch (error) {
      console.log(error);
      message.error("Error deleting tool..");
      return;
    }

  }

  const imageError = (e) => {
    (e.target.parentElement).innerText = "No Image"
  }
  return (
    <div>
      <h1>Sell {JSON.parse(previousSearch).category}</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <div className="addDelTool">
          <div className="floatButtonsRight">
            <input type="button" className="primarybutton" onClick={handleAddToolClick} value="Add" />
            <input type="button" className="secondarybutton" onClick={toggleDelete} value={isDelete ? "Cancel Delete" : "Delete"} />
          </div>
          <input
            type="search"
            placeholder="filter item"
            value={filterText}
            onChange={handleFilterChange}
          />
          <div className="container-layout">
            <div className="main-container">
              <div className="grid-container">
                {myTools.length > 0 ? (//mytool all results
                  myTools.map((item, index) => {
                    let display = false;
                    if (filterText.length < 3) {
                      display = true;
                    }
                    else if ((filterText.length > 2) &&
                      (item.tool_name.toLowerCase().includes(filterText.toLowerCase()) ||
                        item.tool_description.toLowerCase().includes(filterText.toLowerCase()) ||
                        item.tool_make.toLowerCase().includes(filterText.toLowerCase()) ||
                        item.tool_make.toLowerCase().includes(filterText.toLowerCase()) || 
                        item.tool_condition.toLowerCase().includes(filterText.toLowerCase())))
                      {
                      display = true;
                    }

                    if (display) {
                      return (
                        <div className="inline-cardblock" key={item.tool_id} onClick={() => cardClick(item)}>
                          <div className="main-card">
                            <div className={`tool_condition tool_${item.tool_condition}`}>{firstChrUpperCase(item.tool_condition)}</div>
                            {isDelete && <div className={`fav_tool`} id={item.tool_id} onClick={handleDeleteClick}>
                              <img src={deleteIcon} id={item.tool_id} title="Delete Item"></img>
                            </div>}
                            <div className="child-card-img">
                              {((item.tool_image).length > 0) ? <img className="card-img" src={item.tool_image[0]} onError={imageError} /> : <div className='card-img'>No Image</div>}
                            </div>
                            {/* <div className="card-distance">{firstChrUpperCase(item.distance)} Kms away</div> */}
                            <div className="card-price-tag">
                              <div></div>
                              <div className="prim_price_tag">Buy  : ₹ {item.tool_selling_price == null ? "NA" : item.tool_selling_price}</div>
                             {/*  <div className="sec_price_tag">Rent : ₹ {item.tool_rent_price == null ? "NA" : item.tool_rent_price}</div> */}
                            </div>
                            <hr />
                            <div className="card-desc"><span className="detailsCardSpan">{firstChrUpperCase(item.tool_make)}</span></div>
                            <div className="card-desc"><span className="detailsCardSpan">{firstChrUpperCase(item.tool_name)}</span></div>
                          </div>
                        </div>
                      )
                    }
                    display = true;
                  })
                )//mytool all results true part
                  : (
                    <p>No tools available</p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default MyTools;