import axios from 'axios';
import config from "../../env.json";


const BASE_URL = `${config.localEndpoint}`;

//Admin
export const getCompanyDetails = async (params) => {
    try {
        const response = await axios.get(`${BASE_URL}/admin/getCompanyDetails`, { params });
        return response;
    } catch (error) {
        throw new Error(error);
    }
};