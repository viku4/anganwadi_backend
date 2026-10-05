import {
    createAnganwadiService,
    createUserService
} from "../services/index.js";
import { success, error } from "../utils/response.js";

export const createAnganwadi = async (req, res, next) => {
    try {
        const anganwadiService = await createAnganwadiService(req.body);
        const userPayload = {
            ...req.body,
            anganwadiId: anganwadi._id
        };
        const userService = await createUserService(userPayload);
        return success(res, "", states, 200);
    } catch (error) {
        next(error);
    }
};