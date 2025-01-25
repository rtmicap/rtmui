// DetailCard.jsx
import React from 'react';
import { Carousel } from 'antd';
import './DetailCard.scss';

const DetailCard = () => {

  const onChange = (currentSlide) => {
    console.log(currentSlide);
  };

  return (
    <div className="detail-card"> 
      <div className="carousel-container">
        <Carousel afterChange={onChange} dots={false} autoplay>
          <div>
            <h3 className="detail-card-carousel-content">1</h3>
          </div>
          <div>
            <h3 className="detail-card-carousel-content">2</h3>
          </div>
          <div>
            <h3 className="detail-card-carousel-content">3</h3>
          </div>
          <div>
            <h3 className="detail-card-carousel-content">4</h3>
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default DetailCard;
