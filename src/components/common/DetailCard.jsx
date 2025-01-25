import React from 'react';
import { Carousel } from 'antd';
import './DetailCard.scss';

// Custom Left Arrow SVG
const LeftArrow = (props) => (
    <div {...props} className="custom-arrow left-arrow">
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'rotate(180deg)', cursor: 'pointer' }}
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
  
  // Custom Right Arrow SVG
  const RightArrow = (props) => (
    <div {...props} className="custom-arrow right-arrow">
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ cursor: 'pointer' }}
      >
        <path
          d="M9 18l6-6-6-6"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

const DetailCard = () => {
  const onChange = (currentSlide) => {
    console.log(currentSlide);
  };

  return (
    <div className="detail-card">
      <div className="carousel-container">
        <Carousel
          afterChange={onChange}
          dots={false}
          autoplay
          prevArrow={<LeftArrow />}  // Custom Left Arrow
          nextArrow={<RightArrow />}  // Custom Right Arrow
        >
          <div>
            <h3 className="detail-card-carousel-content">Tool Photo 1</h3>
          </div>
          <div>
            <h3 className="detail-card-carousel-content">Tool Photo 2</h3>
          </div>
          <div>
            <h3 className="detail-card-carousel-content">Tool Photo 3</h3>
          </div>
          <div>
            <h3 className="detail-card-carousel-content">Tool Photo 4</h3>
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default DetailCard;
