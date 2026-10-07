import {
    getStatesService,
    getDistrictsService,
    getBlocksService,
    getUsersIdService,
    getVillagesService,
    findByIdAnganwadiService,
} from "../services/index.js";
import { success } from "../utils/response.js";

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
        // console.log("state :-" + state_id);

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
        // console.log("state" + state_id);
        // console.log("district" + district_id);

        const blocks = await getBlocksService({
            stateId: state_id,
            districtId: district_id,
        });

        return success(res, "", blocks, 200);
    } catch (error) {
        next(error);
    }
};
export const getVillages = async (req, res, next) => {
    console.log("state");

    try {
        const { state_id = null, district_id = null, block_id = null } = req.body;
        console.log("state" + state_id);
        console.log("district" + district_id);
        console.log("block" + block_id);

        const blocks = await getVillagesService({
            stateId: state_id,
            districtId: district_id,
            blockId: block_id,
        });

        return success(res, "", blocks, 200);
    } catch (error) {
        next(error);
    }
};


export const getHomeData = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await getUsersIdService(id);
        if (!user) {
            return error(res, "User id not valid", 404);
        }
        console.log(id);
        console.log(user);

        const updatedData = await findByIdAnganwadiService(user.anganwadiId);

        return success(res, "Anganwadi get successfully", updatedData, 200);
    } catch (error) {
        next(error);
    }
};