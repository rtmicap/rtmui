import { FILE_UPLOAD_URL } from "../../api/apiUrls";
import axios from "../../api/axios";

const uploadFileToServer = async (file, name) => {
    const formData = new FormData();
    formData.append('fileName', file);
    try {
        const response = await axios.post(FILE_UPLOAD_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.fileUrl; // Returning the file URL from the server response
    } catch (error) {
        // console.error('Error uploading file: ', error);
        throw error;
    }
};

export default uploadFileToServer;