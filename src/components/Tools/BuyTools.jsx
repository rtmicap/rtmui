import { useState, useEffect } from 'react';
import DetailCard from '../common/DetailCard'; 
import CardSection from '../common/CardSection'; 
import cardData from '../../api/tools_details.json';

function BuyTools() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulating an API call by using the imported JSON data
    setData(cardData);  // You could replace this with a real API call
  }, []);

  return (
    <div>
      <DetailCard />
      <CardSection data={data} />
    </div>
  );
}

export default BuyTools;
