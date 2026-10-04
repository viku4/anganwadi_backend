import { User } from "../models/index.js";

export const createUserService = async (data) => {
  return await User.create(data);
};

export const checkUserExistsService = async (filter = {}) => {
  return await User.findOne({ ...filter })
    .populate("roleId")
    .populate("hotelId");
};

export const loginUserService = async ({ username }) => {
  try {
    const user = await User.findOne({ username })
      .populate("roleId");
    return user;

  } catch (error) {
    console.error("Error in loginUserService:", error);
    throw error;
  }
};

export const getUsersIdService = async (id) => {
  try {
    const user = await User.findOne({ _id: id, status: 1 })
      .populate("roleId");
    return user;
  } catch (error) {
    console.error("Error in loginUserService:", error);
    throw error;
  }
};
export const getUsersIdExistService = async (userId) => {
  return await User.findOne({ _id: userId, })
    .populate("roleId")
    .populate("hotelId");
};
export const updateUserService = async (id, userData) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: userData },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("roleId")
    .populate("hotelId");

  return user;
};

export const getUsersService = async (filter, sort = {}) => {
  try {
    const users = await User.find({
     
      ...filter,
    }).sort(sort)
      .populate("roleId");
    return users;
  } catch (error) {
    console.error("Error in loginUserService:", error);
    throw error;
  }
};

export const getAdminbyHotelService = async (hotelId) => {
  const admin = await User.findOne({
    hotelId,
  }).populate({
    path: "roleId",
    match: { slug: "admin" },
  });

  return admin;
};
