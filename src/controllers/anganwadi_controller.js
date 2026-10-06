import {
    createAnganwadiService,
} from "../services/index.js";
import { success } from "../utils/response.js";

export const createAnganwadi = async (req, res, next) => {
    try {
        const result = await createAnganwadiService(req.user, req.body);
        return success(
            res,
            "Anganwadi and user created successfully",
            result,
            201
        );
    } catch (error) {
        next(error);
    }
};
export const updateAnganwadi = async (req, res, next) => {
    try {
        const result = await createAnganwadiService(req.user, req.body);
        return success(
            res,
            "Anganwadi and user created successfully",
            result,
            201
        );
    } catch (error) {
        next(error);
    }
};