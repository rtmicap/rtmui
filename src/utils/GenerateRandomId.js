import { v4 as uuidV4 } from 'uuid';


export const generateId = () => {
    const randomId = uuidV4();
    const shortRandomId = randomId.substring(0, 6).toUpperCase();
    // console.log("shortRandomId: ", shortRandomId);
    return shortRandomId;
}


