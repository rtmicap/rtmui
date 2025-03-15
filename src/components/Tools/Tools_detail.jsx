import { useState, useEffect } from 'react';
import {message} from 'antd';
import DetailCard from '../common/DetailCard'; 
import { Link, useLocation, useNavigate, useSearchParams  } from 'react-router-dom';
import {firstChrUpperCase} from "../../utils/utils.js";
import { GET_TOOLS_BY_COMPANY_ID } from '../../api/apiUrls.js';
import axios from '../../api/axios.js';

function Tools_detail() {
  const location = useLocation();
  const [toolsDetails,setToolsDetails]= useState(null);
  const [searchParams] = useSearchParams();
  const paramValue = searchParams.get('toolid');


   const getTools_Details=async()=>{
    try{
      if (location.state==null){
        const token = localStorage.getItem('authToken');
              axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
              const response = await axios.get(GET_TOOLS_BY_COMPANY_ID);
              console.log(response.data.result);
              if (response && response.data.result) {
                setToolsDetails(response.data.result[0]);
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
        <p>Loading product details...</p>
      )}
    </div>
    </div>
  );
}

export default Tools_detail;