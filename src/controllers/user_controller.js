import {
  createUserService,
  checkUserExistsService,
  validateRole,
  updateUserService,
  getRoleBySlug,
  loginUserService,
  getUsersIdService,
  getUsersIdExistService,
  getUsersService,
} from "../services/index.js";
import {
  success,
  error,
  createAccessToken,
  createRefreshToken,
} from "../utils/index.js";
import { verifyRefreshToken } from "../middlewares/index.js";

export const createUser = async (req, res, next) => {
  try {
    const { userId, phone, email, roleId } = req.body;
    // console.log("userid:", userId);

    const { id } = req.user;
    console.log("id:", id, userId);

    const userData = req.body;
    const user = await getUsersIdService(id);
    if (!user) {
      return error(res, "User id not valid", 404);
    }
    const roleExists = await validateRole(roleId);
    if (!roleExists) {
      return error(res, "Invalid role selected", 400);
    }
    const currentRole = user.roleId.slug;

    if (userId === undefined || userId === null) {
      const existingUser = await checkUserExistsService({
        $or: [{ phone }, { email }],
      });

      if (existingUser) {
        return error(res, "User with this phone or email already exists", 400);
      }

      const createPermissions = {
        super_admin: ["account"],
        branch_head: ["branch_staff", "anganwadi_staff"],
        branch_staff: ["anganwadi_staff"],
        branch_account: [],
        anganwadi_staff: [],
      };

      if (!createPermissions[currentRole]) {
        return error(res, "You are not authorized to create users", 403);
      }

      if (!createPermissions[currentRole].includes(roleExists.slug)) {
        return error(res, `${currentRole} cannot create ${targetRole}`, 403);
      }
      if (user.roleId.slug === "branch_head") {
        userData.branchId = user.branchId._id;
      } else if (user.roleId.slug === "anganwadi_head") {
        userData.anganwadiId = user.anganwadiId._id;
      }

      userData.createdBy = id;

      const createUser = await createUserService(userData);

      return success(res, "User created successfully", createUser, 201);
    } else {
      const usersIdExist = await getUsersIdExistService(userId);

      if (!usersIdExist) {
        return error(res, "User id not valid", 404);
      }
      const targetRole = usersIdExist.roleId.slug;

      delete userData.email;
      delete userData.password;
      delete userData.userId;
      userData.updatedBy = id;

      // =========================
      // SUPERADMIN
      // =========================

      if (currentRole === "superadmin") {
        // Superadmin cannot edit another superadmin
        if (targetRole === "superadmin") {
          return error(res, "Superadmin cannot edit another superadmin", 403);
        }
      }

      // =========================
      // ADMIN / MANAGER / RECEPTIONIST
      // =========================
      else if (["admin", "manager", "receptionist"].includes(currentRole)) {
        // Same hotel restriction
        if (String(usersIdExist.hotelId) !== String(user.hotelId)) {
          return error(res, "You can only edit users from your hotel", 403);
        }

        const updatePermissions = {
          admin: ["manager", "receptionist"],
          manager: ["receptionist"],
          receptionist: [],
        };
        console.log("role :-", currentRole, targetRole);

        if (!updatePermissions[currentRole].includes(targetRole)) {
          return error(res, `You cannot edit a ${targetRole}`, 403);
        }
      }

      // =========================
      // GUEST / UNKNOWN ROLE
      // =========================
      else {
        return error(res, "You are not authorized to edit users", 403);
      }

      // =========================
      // UPDATE
      // =========================

      const updateUser = await updateUserService(userId, userData);

      return success(res, "User updated successfully", updateUser);
    }
  } catch (err) {
    console.log(err);

    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { id } = req.user;
    const currentUser = await getUsersIdService(id);
    if (!currentUser) {
      return error(res, "User id not valid", 404);
    }
    const createPermissions = {
      super_admin: [
        "branch_head",
        "branch_staff",
        "account",
        "anganwadi_head",
        "anganwadi_worker",
      ],

      branch_head: ["branch_staff", "branch_account", "anganwadi_worker"],

      branch_staff: ["anganwadi_worker"],

      branch_account: ["anganwadi_worker"],

      anganwadi_worker: [],
    };
    const currentRoleSlug = currentUser.roleId?.slug;
    const allowedRoleSlugs = createPermissions[currentRoleSlug] || [];
    if (allowedRoleSlugs.length === 0) {
      return success(res, "", [], 200);
    }
    const allowedRoles = await getRoleBySlug({
      slug: {
        $in: allowedRoleSlugs,
      },
    });

    const allowedRoleIds = allowedRoles.map((role) => role._id);
    const filter = {
      _id: {
        $ne: id,
      },

      roleId: {
        $in: allowedRoleIds,
      },
    };
    const sort = {
      createdAt: -1,
    };
    const users = await getUsersService(filter, sort);

    return success(res, "", users, 200);
  } catch (err) {
    console.error("getUsers error:", err);

    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  // log("loginUser called with body:", req.body);
  try {
    const { username, password } = req.body;

    // log("username:", username, "password:", password);
    const userGet = await loginUserService({ username });
    if (!userGet) {
      return error(res, "Invalid username or password", 402);
    }

    // log("userGet:", userGet);
    // const isSuperAdmin = userGet.roleId?.slug === "superadmin";

    const accessToken = createAccessToken(userGet);
    const refreshToken = createRefreshToken(userGet);

    return success(
      res,
      "",
      {
        accessToken,
        refreshToken,
        user: userGet,
      },
      200,
    );
  } catch (err) {
    next(error);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return error(res, "Refresh token required", 401);
    }

    // verify refresh token
    const decoded = verifyRefreshToken(refresh_token);

    if (!decoded) {
      return error(res, "Invalid refresh token", 401);
    }

    const userGet = await getUsersIdService(decoded.id);

    if (!userGet) {
      return error(res, "User not found", 404);
    }

    const accessToken = createAccessToken(userGet);
    const refreshToken = createRefreshToken(userGet);

    return success(
      res,
      "Access token refreshed successfully",
      {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      200,
    );
  } catch (err) {
    next(error);
  }
};
