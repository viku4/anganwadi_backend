import {
    getStatesService,
    getDistrictsService,
    getBlocksService,
} from "../services/index.js";
import { success, error } from "../utils/response.js";

export const getStates = async (req, res, next) => {
    try {
        const states = await getStatesService();

        return success(res, "", states, 200);
    } catch (error) {
        next(error);
    }
};

export const getDistricts = async (req, res, next) => {
    try {
        const { state_id } = req.body;
        console.log("state :-" + state_id);

        const districts = await getDistrictsService({
            stateId: state_id,
        });
        return success(res, "", districts, 200);
    } catch (error) {   
        next(error);
    }
};

export const getBlocks = async (req, res, next) => {
    try {
        const { state_id, district_id } = req.body;
        console.log("state" + state_id);
        console.log("district" + district_id);

        const blocks = await getBlocksService({
            stateId: state_id,
            districtId: district_id,
        });

        return success(res, "", blocks, 200);
    } catch (error) {
        next(error);
    }
};