import axios from "axios";
import config from "../env.json";

export default axios.create({
    baseURL: `${config.localEndpoint}/api`
});
