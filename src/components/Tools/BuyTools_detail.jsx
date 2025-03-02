import { useState, useEffect } from 'react';
import {message} from 'antd';
import DetailCard from '../common/DetailCard'; 
import cardData from '../../api/tools_details.json';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function BuyTools_detail() {
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toolsDetails } = location.state || {};

  useEffect(() => {
    console.log(toolsDetails, "  test");
      setSelectedProduct(cardData[0]);
  });

  return (
    <div>
    <div>
      {selectedProduct ? (
        <DetailCard product={toolsDetails} tools={toolsDetails}/>
      ) : (
        <p>Loading product details...</p>
      )}
    </div>
    </div>
  );
}

export default BuyTools_detail;