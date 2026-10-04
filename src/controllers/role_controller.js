import {
  createRoleService,
  getRolesService,
  getUsersIdService,
} from "../services/index.js";
import { success, error } from "../utils/response.js";
// Create Role
export const createRole = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await getUsersIdService(id);
    if (!user) {
      return error(res, "User id not valid", 404);
    }
    if (user.roleId.slug === "superadmin") {
      const role = await createRoleService(req.body);
      return success(res, "Role created successfully", role, 201);
    } else {
      return error(res, "Only superadmin can create roles", 403);
    }
  } catch (err) {
    next(error);
  }
};
export const getRoles = async (req, res,next) => {
  try {
    const { id } = req.user;
    const user = await getUsersIdService(id);
    if (!user) {
      return error(res, "User id not valid", 404);
    }
    
    // if (user.roleId.slug === "superadmin") {
      const roles = await getRolesService();
      return success(res, "", roles, 200);
    // } else {
    //   return error(res, "Only superadmin can get roles", 403);
    // }
  } catch (error) {
    next(error);
  }
};
