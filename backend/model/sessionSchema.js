import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    users: [{ type: String }], 
    createdAt: { type: Date, default: Date.now},
  });
  
  const Session = mongoose.model("Session", sessionSchema);

    export default Session;
  