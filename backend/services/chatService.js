import Session from "../model/sessionSchema.js";

export default function socketHandler(io) {
  io.on("connection", async (socket) => {
    const UserId = socket.id;
    console.log("A user connected:", UserId);
    
    // Notify user they've connected
    socket.emit("status", { type: "connected", message: "You are connected to the chat server" });

    try {
      let session = await Session.findOneAndUpdate(
        {},
        { $addToSet: { users: UserId } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      let availableUsers = session.users.filter((user) => user !== UserId);
      let pairedUsers = session.pairs.flat();
      let unpairedUsers = availableUsers.filter((user) => !pairedUsers.includes(user));

      // Notify user they are waiting for a pair
      socket.emit("status", { type: "waiting", message: "Waiting for a chat partner..." });

      if (unpairedUsers.length > 0) {
        const pairedUser = unpairedUsers[0]; // Pick the first available unpaired user
        
        await Session.findOneAndUpdate(
          { _id: session._id },
          { $push: { pairs: [UserId, pairedUser] } }
        );

        // Notify both users they are paired
        io.to(UserId).emit("paired", { userId: pairedUser, message: "You have been paired with a chat partner" });
        io.to(pairedUser).emit("paired", { userId: UserId, message: "You have been paired with a chat partner" });
        
        console.log(`Paired ${UserId} with ${pairedUser}`);
      } else {
        console.log("Waiting for another user to pair...");
      }
    } catch (error) {
      console.error("Error handling connection:", error);
      socket.emit("status", { type: "error", message: "Error connecting to chat service" });
    }

    // Message Handling
    socket.on("message", async (data) => {
      try {
        let session = await Session.findOne();
        let pair = session.pairs.find((p) => p.includes(UserId));
        
        if (pair) {
          const pairedUser = pair.find((user) => user !== UserId);
          io.to(pairedUser).emit("message received", { sender: UserId, text: data });
          console.log(`Message sent from ${UserId} to ${pairedUser}`);
        } else {
          // Notify user they are not paired
          socket.emit("status", { type: "unpaired", message: "You are not currently paired with anyone" });
          console.log("No paired user found.");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("status", { type: "error", message: "Error sending message" });
      }
    });

    // Disconnect Handling
    socket.on("disconnect", async () => {
      console.log("A user disconnected:", UserId);
      try {
        let session = await Session.findOne();
        if (session) {
          session.users = session.users.filter((user) => user !== UserId);

          // Find and remove the pair containing the disconnected user
          let pairIndex = session.pairs.findIndex((p) => p.includes(UserId));
          if (pairIndex !== -1) {
            const pairedUser = session.pairs[pairIndex].find((user) => user !== UserId);
            session.pairs.splice(pairIndex, 1); // Remove the pair
            
            // Notify the other user that their partner disconnected
            io.to(pairedUser).emit("pair disconnected", { 
              message: "Your chat partner has disconnected. Waiting for a new partner..."
            });
            
            // Put the remaining user back in waiting state
            socket.emit("status", { type: "waiting", message: "Waiting for a chat partner..." });
            
            console.log(`Pairing removed for ${UserId} and ${pairedUser}`);
          }

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