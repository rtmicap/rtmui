import axios from 'axios';
import config from "../../env.json";


const BASE_URL = `${config.rtmWsEndpoint}/api`;

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

export const saveUser = async (request, configHeaders) => {
    try {
        const response = await axios.post(`${BASE_URL}/registration/saveuser`, request, configHeaders);
        return response;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const login = async (request, configHeaders) => {
    try {
        const response = await axios.post(`${BASE_URL}/users/login`, request, configHeaders);
        return response;
    } catch (error) {
        // throw new Error(error.message);
        return error;
    }
};

export const currentUser = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/users/currentUser`);
        return response;
    } catch (error) {
        throw new Error(error.message);
        // return error;
    }
};


