import jwt from "jsonwebtoken";
import { success, error } from "../utils/response.js";

export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "Token required", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

    req.user = decoded;
    next();
  } catch (e) {
    return error(res, "Invalid token" + e, 401);
  }
};
export const verifyRefreshToken = (refresh_token) => {
  try {
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};
