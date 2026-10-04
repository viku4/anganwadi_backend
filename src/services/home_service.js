import { State, District, Block } from "../models/index.js";


export const getStatesService = async () => {
    return await State.find({
        status: 1,
    })
        .select("_id name")
        .sort({ name: 1 })
        .lean();
};

export const getDistrictsService = async ({ stateId }) => {
    const filter = {
        status: 1,
    };

    if (stateId) {
        filter.stateId = stateId;
    }

    return await District.find(filter)
        .select("_id name stateId")
        .populate("stateId", "_id name")
        .sort({ name: 1 })
        .lean();
};

export const getBlocksService = async ({ stateId, districtId }) => {
    const filter = {
        status: 1,
    };

    if (stateId) {
        filter.stateId = stateId;
    }

    if (districtId) {
        filter.districtId = districtId;
    }

    return await Block.find(filter)
        .select("_id name stateId districtId")
        .populate("stateId", "_id name")
        .populate("districtId", "_id name")
        .sort({ name: 1 })
        .lean();
};