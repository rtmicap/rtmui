import { useState, useEffect } from "react";
import { SAVE_TOOLS, FILE_UPLOAD_URL } from "../../api/apiUrls";
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import "./sell.scss";

function SellTools() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: "",
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
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    let itemCategory = JSON.parse(sessionStorage.getItem('searchParam')).category;


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

        // Create preview URLs for the selected files
        const imageUrls = files.map((file) => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...imageUrls]);
        setSelectedFiles([...selectedFiles, ...files]); // Append to previously selected files
    };

    const handleRemoveImage = (indexToRemove) => {
        // Remove image and file at the given index
        setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
        setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleUploadImages = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true); // Set uploading state to true

        try {
            const formDataForUpload = new FormData();
            selectedFiles.forEach((file) => {
                formDataForUpload.append('fileName', file); // Add files to the formData
            });

            // Make the API call to upload images
            const token = localStorage.getItem("authToken");
            axios.defaults.headers.common["authorization"] = "Bearer " + token;

            const response = await axios.post(FILE_UPLOAD_URL, formDataForUpload);

            if (response.status === 200 && response.data.files) {
                // Extract the URLs from the response
                const uploadedUrls = response.data.files.map((file) => file.fileUrl);

                // Update the formData with uploaded image URLs
                setFormData(prevState => ({
                    ...prevState,
                    images: [...prevState.images, ...uploadedUrls], // Store URLs in images
                }));

                alert('Images uploaded successfully');
            } else {
                alert('Failed to upload images');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error uploading images');
        } finally {
            setIsUploading(false); // Reset uploading state
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct the request payload with image URLs
        const payload = {
            category: itemCategory.toLowerCase(),
            toolname: formData.name,
            description: formData.description,
            specifications: formData.specifications,
            make: formData.make,
            sellingprice: parseFloat(formData.sellingPrice) || 0,
            quantity: parseInt(formData.quantity, 10) || 0,
            condition: formData.condition,
            image: formData.images, // Use the URLs stored in images
        };

        try {
            const token = localStorage.getItem("authToken");
            axios.defaults.headers.common["authorization"] = "Bearer " + token;
            console.log(payload);
            const response = await axios.post(SAVE_TOOLS, payload);
            if (response.status === 200 && response.data.result) {
                setMessage({ type: "success", text: "Tool listed successfully!" });
                setTimeout(() => {
                    navigate("/my-tools"); // Navigate to MyTools page after showing the message
                }, 2000);
            } else {
                setMessage({ type: "error", text: "Error submitting item. Please try again." });
            }
        } catch (error) {
            console.error("Error submitting tool:", error);
            setMessage({ type: "error", text: "Error submitting item. Please try again." });
        }
    };

    useEffect(() => {
        if (message?.type === "success") {
            console.log("Success Message Shown"); // Log when success message is shown
        }
    }, [message]);

    return (
        <div className="sell-tools-form">
            <h1>Sell Your Item</h1>
            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label>
                    Name
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </label>

                <label>
                    Description
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                </label>

                <label>
                    Specifications
                    <textarea name="specifications" value={formData.specifications} onChange={handleChange} required />
                </label>

                <label>
                    Make
                    <input type="text" name="make" value={formData.make} onChange={handleChange} required />
                </label>


                <label>
                    Selling Price (Rs)
                    <input type="text" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required />
                </label>

                <label>
                    Quantity
                    <input type="text" name="quantity" value={formData.quantity} onChange={handleChange} required />
                </label>

                <label>
                    Condition
                    <select name="condition" value={formData.condition} onChange={handleChange}>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                    </select>
                </label>

                <label>
                    Upload Images (Max 4)
                    <div className="file-upload-container">
                        <input
                            id="file-upload-input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                        />
                        <button
                            type="button"
                            className="upload-button"
                            onClick={handleUploadImages}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </label>

                <div className="image-preview">
                    {imagePreviews.map((src, index) => (
                        <div key={index} className="image-preview-container">
                            <img src={src} alt="Uploaded preview" width="100" className="image-preview-image" />
                            <button
                                type="button"
                                className="remove-image-button"
                                onClick={() => handleRemoveImage(index)}
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>


                <button type="button" className="primarybutton">Register</button>
            </form>
        </div>
    );
}

export default SellTools;
