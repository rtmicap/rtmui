//import React from 'react';
import PropTypes from 'prop-types';
import { Card, Space } from 'antd';

const CardSection = ({ data }) => {
  return (
    <Space direction="vertical" size={16} style={{ marginTop: '20px' }}>
      {data.length === 0 ? (
        <p>Loading...</p>
      ) : (
        data.map((card, index) => (
          <Card
            key={index}
            title={card.toolname}  // Corrected to match the data structure (toolname instead of title)
            extra={<a href="#">More</a>}
            style={{ width: 300 }}
          >
            <p>Description: {card.description}</p>  {/* Corrected to match the description key */}
            <p>Condition: {card.condition}</p>  {/* Corrected to match condition */}
            <p>Year of Purchase: {card.yearofpurchase}</p>  {/* Corrected to match yearofpurchase */}
          </Card>
        ))
      )}
        {/* Static card for Price Details */}
        <Card
        title="Price Details"
        extra={<a href="#">More</a>}
        style={{ width: 300 }}
      >
        <p>Price: $500</p>
        <p>Discount: 10%</p>
        <p>Final Price: $450</p>
      </Card>

      {/* Static card for Additional Details */}
      <Card
        title="Additional Details"
        extra={<a href="#">More</a>}
        style={{ width: 300 }}
      >
        <p>Warranty: 2 years</p>
        <p>Shipping: Free shipping within 7 days</p>
        <p>Returns: 30-day return policy</p>
      </Card>
    </Space>
  );
};

// Add prop types validation
CardSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      toolname: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      condition: PropTypes.string.isRequired,
      yearofpurchase: PropTypes.number.isRequired
    })
  ).isRequired
};

export default CardSection;
