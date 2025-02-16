import React from 'react';
import PropTypes from 'prop-types';
import './DetailCard.scss'; // Import your SCSS file

import image1 from '../../assets/Hired_duration.jpg'; 
import image2 from '../../assets/Rental_duration.jpg'; 
import image3 from '../../assets/Hired_duration.jpg'; 

// Map the image names from the JSON to the actual imported images
const imagesMap = [image1, image2, image3];
  console.log("Image Map:", imagesMap);

// Carousel Component
const Carousel = ({ imagesMap }) => {
    console.log("Images being passed to Carousel:", imagesMap);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const nextSlide = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesMap.length);
    };

    const prevSlide = () => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + imagesMap.length) % imagesMap.length);
    };

    return (
      <div className="carousel-container">
        <button onClick={prevSlide}>❮</button>
        <div style={{ transform: `translateX(-${currentIndex * 100}%)`, display: 'flex' }}>
          {imagesMap.map((imageName, index) => (
            <div key={index}><img  src={imageName} alt={`Slide ${index}`} /> </div>
              
            
          ))}
        </div>
        <button onClick={nextSlide}>❯</button>
      </div>
    );
  };

Carousel.propTypes = {
  imagesMap: PropTypes.arrayOf(PropTypes.string).isRequired,
};
  
  // DetailCard Component
  const DetailCard = ({ product }) => {
    const { toolname, description, priceDetails, additionalDetails, images } = product;
  
    return (
      <div className="detail-card-container">
        <Carousel imagesMap={imagesMap} />
        <h2>{toolname}</h2>
        <p>{description}</p>
        <div className="pricing-info">
          <h3>Pricing Information</h3>
          <p>Original Price: ${priceDetails.price}</p>
          <p>Discount: {priceDetails.discount}%</p>
          <p>Final Price: ${priceDetails.finalPrice}</p>
        </div>
        <div className="additional-details">
          <h3>Additional Details</h3>
          <p>Warranty: {additionalDetails.warranty}</p>
          <p>Shipping: {additionalDetails.shipping}</p>
          <p>Returns: {additionalDetails.returns}</p>
        </div>
      </div>
    );
  };
  
  // PropTypes for DetailCard
  DetailCard.propTypes = {
    product: PropTypes.shape({
      toolname: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      priceDetails: PropTypes.shape({
        price: PropTypes.number.isRequired,
        discount: PropTypes.number.isRequired,
        finalPrice: PropTypes.number.isRequired,
      }).isRequired,
      additionalDetails: PropTypes.shape({
        warranty: PropTypes.string.isRequired,
        shipping: PropTypes.string.isRequired,
        returns: PropTypes.string.isRequired,
      }).isRequired,
      images: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  };
  
  export default DetailCard;