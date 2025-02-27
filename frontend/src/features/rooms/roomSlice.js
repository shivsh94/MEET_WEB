import {createSlice } from "@reduxjs/toolkit";

const initialState = {
    rooms: [],
    currentRoom: null,
};
console.log("initialState",initialState.rooms);

export const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        setRooms: (state, action) => {
            state.rooms = action.payload;
            console.log("rooms",state.rooms);
        },
        setCurrentRoom: (state, action) => {
            state.currentRoom = action.payload;
            console.log("currentRoom",state.currentRoom);
        },
    },
});

export const { setRooms, setCurrentRoom } = roomSlice.actions;
export default roomSlice.reducer;