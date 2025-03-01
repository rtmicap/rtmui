import { useState, useEffect } from "react";
import { SAVE_TOOLS } from "../../api/apiUrls";
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import "./sell.scss";

function SellTools() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        specifications: "",
        make: "",
        rentPrice: "",
        sellingPrice: "",
        quantity: "",
        condition: "new",
        images: [],
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "rentPrice" || name === "sellingPrice") {
            if (!/^\d*\.?\d*$/.test(value)) return; // Allow only numbers and decimals
        }

        if (name === "quantity") {
            if (!/^\d*$/.test(value)) return; // Allow only integers
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 4) {
            alert("You can upload a maximum of 4 images.");
            return;
        }

        const imageUrls = files.map((file) => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...imageUrls]);
        setFormData({ ...formData, images: [...formData.images, ...files] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct the request payload
        const payload = {
            toolname: formData.name,
            description: formData.description,
            specifications: formData.specifications,
            make: formData.make,
            rentprice: parseFloat(formData.rentPrice) || 0,
            sellingprice: parseFloat(formData.sellingPrice) || 0,
            quantity: parseInt(formData.quantity, 10) || 0,
            condition: formData.condition,
            image: formData.images.map((file) => file.name), // Assuming backend handles file upload separately
        };

        try {
            const token = localStorage.getItem("authToken");
            axios.defaults.headers.common["authorization"] = "Bearer " + token;

            const response = await axios.post(SAVE_TOOLS, payload);
            console.log("Response:", response); // Log response

            if (response && response.data.success) {
                setMessage({ type: "success", text: "Tool listed successfully!" }); // ✅ Show success message
                console.log("Message Set:", { type: "success", text: "Tool listed successfully!" }); // Log message set
            }
        } catch (error) {
            console.error("Error submitting tool:", error);
            navigate("/login"); // Redirect to login if unauthorized
        }
    };

    // Reset the form and message after 2 seconds
    useEffect(() => {
        if (message?.type === "success") {
            console.log("Success Message Shown"); // Log when success message is shown
            setTimeout(() => {
                console.log("Resetting Form and Message...");
                setFormData({
                    name: "",
                    description: "",
                    specifications: "",
                    make: "",
                    rentPrice: "",
                    sellingPrice: "",
                    quantity: "",
                    condition: "new",
                    images: [],
                });
                setImagePreviews([]);
                setMessage(null); // Reset the message
            }, 2000); // 2 seconds
        }
    }, [message]);

    return (
        <div className="sell-tools-form">
            <h1>Sell Your Tool</h1>
            {message && message.type === "success" && (
                <div className="message success">
                    {message.text}
                </div> // Display success message
            )}

            <form onSubmit={handleSubmit}>
                <label>
                    Name: 
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </label>

                <label>
                    Description:
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                </label>

                <label>
                    Specifications:
                    <textarea name="specifications" value={formData.specifications} onChange={handleChange} required />
                </label>

                <label>
                    Make:
                    <input type="text" name="make" value={formData.make} onChange={handleChange} required />
                </label>

                <label>
                    Rent Price:
                    <input type="text" name="rentPrice" value={formData.rentPrice} onChange={handleChange} required />
                </label>

                <label>
                    Selling Price:
                    <input type="text" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required />
                </label>

                <label>
                    Quantity:
                    <input type="text" name="quantity" value={formData.quantity} onChange={handleChange} required />
                </label>

                <label>
                    Condition:
                    <select name="condition" value={formData.condition} onChange={handleChange}>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                    </select>
                </label>

                <label>
                    Upload Images (Max 4):
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                </label>

                <div className="image-preview">
                    {imagePreviews.map((src, index) => (
                        <img key={index} src={src} alt="Uploaded preview" width="100" />
                    ))}
                </div>

                <button type="submit">Sell Tool</button>
            </form>
        </div>
    );
}

export default SellTools;
