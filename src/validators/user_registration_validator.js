import Joi from "joi";
const GUEST_ROLE_ID = "6a34db3cae3eac4d82a572f4";

export const createUserSchema = Joi.object({
  userId: Joi.string().hex().length(24).allow(null)
    .optional(),


  name: Joi.string().min(2).max(50).required(),

  roleId: Joi.string().hex().length(24).required().messages({
    "string.base": "roleId must be a string",
    "string.hex": "roleId must be a valid ObjectId",
    "string.length": "roleId must be 24 characters",
    "any.required": "roleId is required",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "phone must be 10 digits",
      "any.required": "phone is required",
    }),

  email: Joi.string()
    .email()
    .when("userId", {
      is: Joi.valid(null),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.email": "email must be a valid email address",
      "any.required": "email is required",
    }),
  username: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(30)
    .pattern(/^[a-z0-9_.]+$/)
    .when("userId", {
      is: Joi.valid(null),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.empty": "username is required",
      "any.required": "username is required",
      "string.min": "username must be at least 3 characters",
      "string.max": "username cannot exceed 30 characters",
      "string.pattern.base": "username can contain only lowercase letters, numbers, underscore and dot",
    }),
  password: Joi.string()
    .min(6)
    .when("userId", {
      is: Joi.valid(null),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.min": "password must be at least 6 characters long",
      "string.base": "password must be a string",
      "any.required": "password is required",
    }),

  status: Joi.number().valid(1, 0).optional(),
});
