import Session from "../model/sessionSchema.js";
import mongoose from "mongoose";

export default function socketHandler(io) {
  io.on("connection", async (socket) => {
    const UserId = socket.id;
    console.log("A user connected:", UserId);

    // Define getRandomUser before using it
    const getRandomUser = async () => {
      try {

        const session = await Session.findOne().sort({ createdAt: -1 }); 
    
        if (!session) {
          console.log("No active session found.");
          return null;
        }
    
        const result = await Session.aggregate([
          {
            $match: { _id: session._id }, 
          },
          {
            $project: {
              randomUser: {
                $arrayElemAt: [
                  "$users",
                  {
                    $floor: {
                      $multiply: [{ $rand: {} }, { $size: "$users" }],
                    },
                  },
                ],
              },
            },
          },
        ]);
    
        return result.length ? result[0].randomUser : null;
      } catch (error) {
        console.error("Error fetching random user:", error);
        return null;
      }
    };
    

    try {
      
      let session = await Session.findOne();

      if (!session) {
        session = new Session({ users: [UserId] });
      } else if (!session.users.includes(UserId)) {
        session.users.push(UserId);
      }

      await session.save();
    } catch (error) {
      console.error("Error handling connection:", error);
    }

    socket.on("message", async (data) => {
      console.log("Message received:", data);

      try {
        const randomUser = await getRandomUser(); 
        console.log("Random user:", randomUser);
        if (randomUser) {
          io.to(randomUser).emit("message received", data);
        } else {
          console.log("No random user found.");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected:", UserId);

      try {
        let session = await Session.findOne();
        if (session) {
          session.users = session.users.filter((user) => user !== UserId);

          if (session.users.length === 0) {
            await Session.deleteOne({ _id: session._id });
            console.log("Session ended: No users left.");
          } else {
            await session.save();
          }
        }
      } catch (error) {
        console.error("Error updating session on disconnect:", error);
      }
    });
  });
}
