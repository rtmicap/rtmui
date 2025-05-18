import {React, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import './DetailCard.scss'; // Import your SCSS file
import axios from '../../api/axios.js';
import { EDIT_TOOL,GET_COMPANY_DETAILS_BY_ID } from '../../api/apiUrls.js';
import { message } from 'antd';



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
        <div className="img-counter">{1+(-leftPos/100)}/{imagesMap.length}</div>
        </div>
    :
        <div className="img-main-container">
         <div className="Noimg-container">
          No Images!!
        </div>
        </div>
    )
  };

  // DetailCard Component
  const DetailCard = ({product, transtype}) => {
    const [isEdit,setIsEdit]=useState(false);
    const [editProduct,setEditProduct]=useState(product);
    const [companyDetails,setCompanyDetails]=useState({
      companyName:"",
      offEmail:"",
    })
    const handleEditToolClick=async(e)=>{
      e.preventDefault();
      setIsEdit(!isEdit);
          if(e.target.value=="Save"){
          const payload = {
                      toolid:editProduct.tool_id,
                      specifications: editProduct.tool_specifications,
                      rentprice: parseFloat(editProduct.tool_rent_price),
                      sellingprice: parseFloat(editProduct.tool_selling_price),
                      quantity: parseInt(editProduct.tool_quantity, 10)
                  };
          
                  try {
                      const token = localStorage.getItem("authToken");
                      axios.defaults.headers.common["authorization"] = "Bearer " + token;                
                      const response = await axios.patch(EDIT_TOOL, payload);
                      if (response.status === 200 && response.data.result[0]!=0) {
                        setIsEdit(!isEdit);
                        message.success("Item Updated Successfully")
                      } else {
                        message.error("Item not found. Update failed");
                        setEditProduct(product);
                      }
                  } catch (error) {
                      message.error("Item Update Failed");
                      setEditProduct(product);
                  } 
                }
          };

    
    const handlecancelClick=()=>{
      setIsEdit(false);
    }

    const handleOnChange=(e)=>{
      let key = e.target.name;
      let value = e.target.value;
      setEditProduct(prevState => ({ ...prevState, [key]:value }));
    }

    const handleAddToCart=()=>{
      message.success("Item added to cart.")
    }

    const getCompanyDetailsById = async () => {
            try {
                let companyId=product.id;
                const response = await axios.get(GET_COMPANY_DETAILS_BY_ID, {
                    params: { companyId }
                });
                setCompanyDetails(response.data.data);
                
            } catch (error) {
                if (error && error.response.status == 401) {
                    message.warning("Unauthorized! Please log in again!");
                    navigate("/login");
                } else {
                    message.error("Error fetching Company Details");
                }
            }
        };
        useEffect(()=>
          {
            getCompanyDetailsById();
          },[])

    return (
      <div className="detail-card-container">
        <Carousel imagesMap={product.tool_image} />
        <div className="tools_info_card">
        <div className="titleCard">
        <h3>{product.tool_name}</h3>
        <p><span className="detailsCardSpan">Make         : </span>{product.tool_make + transtype} </p>
        <p><span className="detailsCardSpan">Description  : </span>{product.tool_description}</p>
        <p><span className="detailsCardSpan">Availble QTY : </span>{(isEdit)?<input className="inputFields" type="text" name="tool_quantity" defaultValue={editProduct.tool_quantity} onChange={handleOnChange}/>:editProduct.tool_quantity}</p>
        </div>
        </div>
        <div className="pricing-info">
          <h3>Pricing Information</h3> 
          <hr/>
          {(product.tool_selling_price!=null)?
            <p><span className="detailsCardSpan">Sell Price: ₹ </span>{(isEdit)?<input className="inputFields" type="text" name="tool_selling_price" defaultValue={editProduct.tool_selling_price} onChange={handleOnChange}/>:editProduct.tool_selling_price}</p>
            :
            <p><span className="detailsCardSpan">Sell Price: </span> Not Available</p>
          }
          {(product.tool_rent_price!=null)?
          <p><span className="detailsCardSpan">Rent Price: ₹ </span>{(isEdit)?<input className="inputFields" type="text" name="tool_rent_price" defaultValue={editProduct.tool_rent_price} onChange={handleOnChange}/>:editProduct.tool_rent_price} <span> / day</span></p>
            :
            <p><span className="detailsCardSpan">Rent Price: </span> Not Available</p>
          }
        </div>
        <div className="additional-details">
          <h3>Specifications</h3>
          <hr/>
          <div className="additional-details-content">
          <p>{(isEdit)?<textarea className="inputTextArea" name="tool_specifications" defaultValue={editProduct.tool_specifications} onChange={handleOnChange}/>:editProduct.tool_specifications}</p>
          </div>
        </div>
        
        {transtype=="sell"?
        <><div className="btn_container">
        <input type="button" className="primarybutton" onClick={handleEditToolClick} value={isEdit?"Save":"Edit"} />
        {isEdit?
                <input type="button" className="secondarybutton" onClick={handlecancelClick}value="Cancel" />:
                <></>
        }
        </div></>:
        <>
         <div className="seller_info">
         <h3>Seller</h3>
         <hr/>
         <p><span className="detailsCardSpan">Company Name : </span>{companyDetails.companyName} </p>
         <p><span className="detailsCardSpan">Email        : </span>{companyDetails.offEmail}</p>
         </div>
         <div className='btn_container'>
         <input type="button" className="primarybutton" value="Add to Cart" onClick={handleAddToCart}/>
         </div>
         </>
        }

     
      </div>
    );
  };
  
  
  export default DetailCard;