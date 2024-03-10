import axios from 'axios';
import config from "../../env.json";


const BASE_URL = `${config.localEndpoint}/api`;

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

export const getMachinesByCatAndType = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/machines/getMachinesByCatAndType`);
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const registerMachine = async (request, configHeaders) => {
    try {
        const response = await axios.post(`${BASE_URL}/machines/registerMachine`, request, configHeaders);
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
};
