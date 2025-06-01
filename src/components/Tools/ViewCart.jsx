import { React, useEffect, useState } from 'react';
import { GET_CART, DELETE_CART } from '../../api/apiUrls.js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import axios from '../../api/axios';

function ViewCart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const getCartItem = async () => {
        try {
            const token = localStorage.getItem('authToken');
            axios.defaults.headers.common['authorization'] = 'Bearer ' + token;

            const response = await axios.get(GET_CART);
            if (response && response.data.result) {
                setCart(response.data.result);
                return;
            }
        }
        catch (error) {
            message.error("Your cart is not available now!!")
        }
    }
    const totalPrice = cart.reduce(
        (acc, item) => acc + item.tool_selling_price * item.quantity,0
    );
    const updateQuantity = (id, qty, price) => {
        setCart((prev) =>
            prev.map((item) =>
                item.tool_id === id ? { ...item, quantity: Number(qty) } : item
            )
        );
        message.success("Cart item updated");
    };

    const removeItem = async (id) => {

        console.log(id)
        try {
            const token = localStorage.getItem('authToken');
            axios.defaults.headers.common['authorization'] = 'Bearer ' + token;

            const response = await axios.delete(DELETE_CART + `/${id}`);
            console.log(response);
            if (response && response.data.code == 1) {
                setCart((prev) => prev.filter((item) => item.tool_id !== id));
                message.success("Item removed from your cart!!")
                return;
            }
        }
        catch (error) {
            if (error.response.status === 400 && error.response.data.error == "Item does not exists in the cart") {
                message.error("Item already removed from your cart");
            } else {
                message.error("Error deleting item from cart")
            }
        }
    };

    const displayTools = (item)=>{

         navigate(`/tools-detail/?toolid=${item.tool_id}`, {
                state: {
                    toolsDetails: item,
                    transType: 'buy'
                },
            });
    }

    const checkOutCart = () => {
        message.success("Proceed to checkout");
    }

    useEffect(() => {
        getCartItem();
    }, []);

    const imageError = (e) => {
        (e.target.parentElement).innerText = "No Image"
    }



    return (
        <div>
            <h1>Your Cart</h1>
            <hr></hr>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    {
                        cart.map((item) => (
                          
                                <div
                                    key={`item`+item.tool_id}
                                    style={{
                                        display: 'flex',
                                        borderBottom: '1px solid #ddd',
                                        padding: '15px 0',
                                        alignItems: 'center',
                                    }}
                                   
                                >
                                    <div className="imageContainer"  onClick={()=>displayTools(item)}><img
                                        src={item.tool_image[0]}
                                        alt="Image Not Available"
                                        style={{ width: 120, height: 120, objectFit: 'contain', marginRight: 20 }}
                                        onError={imageError}
                                    /></div>
                                    <div className="cartItemDetails">
                                        <h2 style={{ fontSize: 18, margin: '0 0 10px' }}>{item.name}</h2>
                                        <div>
                                            <div className="itemDetails">
                                                {item.tool_name} - {item.tool_make}
                                            </div>
                                            <label className="qtyLabel">
                                                Quantity: 
                                                <select
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.tool_id, e.target.value, item.tool_selling_price)}
                                                    className="itemQty"
                                                >
                                                    {[...Array(item.tool_quantity).keys()].map((n) => (
                                                        <option key={n + 1} value={n + 1}>
                                                            {n + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                        <button className='btnLink' onClick={() => removeItem(item.tool_id)} >
                                            Remove
                                        </button>
                                    </div>
                                    <div style={{ fontWeight: 'bold', fontSize: 18 }}>
                                        ₹ {(item.tool_selling_price)}
                                    </div>
                                </div> 
                        ))}
                    <div className="totalCartCost">Total Purchase Cost:     <span>    ₹ {totalPrice.toFixed(2)}</span></div>
                    <hr></hr>
                    <div className="btn_container">

                        <button className='primarybutton' onClick={checkOutCart}> Checkout</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ViewCart;