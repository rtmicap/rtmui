import {React, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import './DetailCard.scss'; // Import your SCSS file



// Map the image names from the JSON to the actual imported images
//const imagesMap = [image1, image2, image3, image4];

// Carousel Component
const Carousel = (imagesMap) => {
    imagesMap=Object.values(imagesMap)[0];
    const [leftPos, setLeftPos] = useState(0);    
    const nextSlide = () => {
      if(imagesMap.length>1){
      if (leftPos/(imagesMap.length)==0 || -leftPos/(imagesMap.length-1)<100 ){
      setLeftPos((leftPos) => (leftPos - 100));
      }
    }
    };

    const prevSlide = () => {
      if(leftPos<0){
      setLeftPos((leftPos) => (leftPos + 100));
      }
    };

    return(imagesMap.length?
    
      <div className="img-main-container">
          <div className="img-btn-left"><input type="button" className="img-btn" onClick={prevSlide} value="<" /> </div>
          <div className="img-btn-right"><input type="button" className="img-btn" onClick={nextSlide} value=">" /> </div>
        <div className="img-repo-container" style={{marginLeft:`${leftPos}%`,width:`${imagesMap.length*100}%`}}>
        {imagesMap.map((imageName, index) => (
        <div className="img-container" key={index}><img  src={imageName} alt={`Slide ${index}`} /> </div>
        ))
        }
        </div>
        </div>
    :
        <div className="img-main-container">
         <div className="Noimg-container">
          No Images Uploaded!!
        </div>
        </div>
    )
  };

  // DetailCard Component
  const DetailCard = ({product}) => {
      console.log(product,"   Details page");
    return (
      <div className="detail-card-container">
        <Carousel imagesMap={product.tool_image} />
        <div className="titleCard">
        <h3>{product.tool_name}</h3>
        <p><span className="detailsCardSpan">Make         : </span>{product.tool_make} </p>
        <p><span className="detailsCardSpan">Description  : </span>{product.tool_description}</p>
        <p><span className="detailsCardSpan">Availble QTY : </span>{product.tool_quantity}</p>
        </div>
        <div className="pricing-info">
        <hr/>
          <h3>Pricing Information</h3>
          <hr/>
          {(product.tool_selling_price!=null)?
          <p><span className="detailsCardSpan">Sell Price: ₹ </span>{product.tool_selling_price}</p>
            :
            <p><span className="detailsCardSpan">Sell Price: </span> Not Available</p>
          }
          {(product.tool_rent_price!=null)?
          <p><span className="detailsCardSpan">Rent Price: ₹ </span>{product.tool_rent_price}</p>
            :
            <p><span className="detailsCardSpan">Rent Price: </span> Not Available</p>
          }
        </div>
        <div className="additional-details">
        <hr/>
          <h3>Additional Details</h3>
          <hr/>
          <div className="additional-details-content">
          <p><span className="detailsCardSpan">Make : </span>{product.tool_make} </p>
          </div>
        </div>
      </div>
    );
  };
  
  
  export default DetailCard;