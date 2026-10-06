import {
    createBranchService,
} from "../services/index.js";
import { success } from "../utils/response.js";

export const createBranch = async (req, res, next) => {
    try {
        const result = await createBranchService(req.user, req.body);
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
