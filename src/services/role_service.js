import { Role } from "../models/index.js";
export const createRoleService = async (data) => {
  return await Role.create(data);
};

export const getRolesService = async () => {
  const roleGet = await Role.find({ slug: { $ne: "super_admin" }, status: 1 });
  return roleGet;
};

export const validateRole = async (roleId) => {
  const role = await Role.findOne({ _id: roleId, status: 1 });
  return role;
};

export const getRoleBySlug = async (filter) => {
  return await Role.find({
    ...filter,
  });
};  
