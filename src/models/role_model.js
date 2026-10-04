import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: Number,
      enum: [1, 0],
      default: 1,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
