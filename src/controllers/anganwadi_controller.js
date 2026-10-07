import {
  createAnganwadiService,
  updateAnganwadiService,
  findByIdAnganwadiService
} from "../services/index.js";
import { success } from "../utils/response.js";

export const createAnganwadi = async (req, res, next) => {
  try {
    const result = await createAnganwadiService(req.user, req.body);
    return success(res, "Anganwadi and user created successfully", result, 201);
  } catch (error) {
    next(error);
  }
};
export const updateAnganwadi = async (req, res, next) => {
  try {
    const { id } = req.user;
    const data = {
      ...req.body,
      updatedBy: req.user.id,
    };
    const updatedData = await updateAnganwadiService(data.id, data);

    return success(res, "Anganwadi updated successfully", updatedData, 200);
  } catch (error) {
    next(error);
  }
};
export const getByIdAnganwadi = async (req, res, next) => {
  try {
    const { id } = req.body;

    const updatedData = await findByIdAnganwadiService(id);

    return success(res, "Anganwadi get successfully", updatedData, 200);
  } catch (error) {
    next(error);
  }
};
