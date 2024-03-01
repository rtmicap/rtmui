import axios from 'axios';

const BASE_URL = 'http://localhost:5100/api';

export const getAllStates = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/locations/getAllStates`);
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const getAllCitiesByStateCode = async (request) => {
    try {
        const response = await axios.post(`${BASE_URL}/locations/getAllCitiesByStateCode`, request);
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
};
