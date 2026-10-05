import { Anganwadi } from "../models/index.js";
export const createAnganwadiService = async (data) => {
    return await Anganwadi.create(data);
};
