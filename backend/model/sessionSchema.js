import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    users: [String], 
    pairs: {
      type: [[String]], 
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
