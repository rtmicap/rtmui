import { useState, useEffect } from 'react';
import {message} from 'antd';
import DetailCard from '../common/DetailCard'; 
import { Link, useLocation, useNavigate, useSearchParams  } from 'react-router-dom';
import {firstChrUpperCase} from "../../utils/utils.js";
import { GET_TOOL_BY_ID } from '../../api/apiUrls.js';
import axios from '../../api/axios.js';

function Tools_detail() {
  const location = useLocation();
  const [toolsDetails,setToolsDetails]= useState(null);
  const [searchParams] = useSearchParams();
  const tools_id = searchParams.get('toolid');

   const getTools_Details=async()=>{
    try{
      if (location.state==null){
        const token = localStorage.getItem('authToken');
              axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
              const response = await axios.get(GET_TOOL_BY_ID+`/${tools_id}`);
              console.log(response.data.result);
              if (response && response.data.result.length>0) {
                setToolsDetails(response.data.result[0]);
              }else{
                setToolsDetails(null);
              }
            }
            else{
              setToolsDetails(location.state.toolsDetails);
            }
    
    }catch(e){
      console.log(e);
    }
    
  } 

  useEffect(()=>
  {
    getTools_Details();
    console.log(toolsDetails);
  },[])

  return (
    <div>
    <div>
      {toolsDetails ? (
        <DetailCard product={toolsDetails}/>
      ) : (
        <p>Product details not found</p>
      )}
    </div>
    </div>
  );
}

export default Tools_detail;