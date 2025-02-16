import { useState, useEffect } from 'react';
import DetailCard from '../common/DetailCard'; 
import cardData from '../../api/tools_details.json';

function BuyTools_detail() {
  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setData(cardData);
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setSelectedProduct(data[0]);
    }
  }, [data]);

  return (
    <div>
    <div>
      {selectedProduct ? (
        <DetailCard product={selectedProduct} />
      ) : (
        <p>Loading product details...</p>
      )}
    </div>
    </div>
  );
}

export default BuyTools_detail;