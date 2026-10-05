import Joi from "joi";

export const createAnganwadiSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required(),

    stateId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex": "State must be a valid ObjectId",
            "string.length": "State must be a valid ObjectId"
        }),

    districtId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex": "District must be a valid ObjectId",
            "string.length": "District must be a valid ObjectId"
        }),

    blockId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex": "Block must be a valid ObjectId",
            "string.length": "Block must be a valid ObjectId"
        }),
    villageId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex": "Village must be a valid ObjectId",
            "string.length": "Village must be a valid ObjectId"
        }),
    pincode: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            "string.pattern.base": "Pincode must be exactly 6 digits"
        }),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional(),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional(),

    address: Joi.string()
        .trim()
        .max(500)
        .optional(),

    partnerName: Joi.string()
        .trim()
        .required(),

    partnerUsername: Joi.string()
        .trim()
        .min(4)
        .max(50)
        .required(),

    partnerPassword: Joi.string()
        .min(6)
        .max(100)
        .required(),

    partnerEmail: Joi.string()
        .email()
        .required(),

    partnerPhone: Joi.string()
        .pattern(/^[6-9][0-9]{9}$/)
        .required()
        .messages({
            "string.pattern.base":
                "Partner phone number must be a valid 10-digit mobile number"
        })
});
