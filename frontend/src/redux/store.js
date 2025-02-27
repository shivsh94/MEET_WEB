import {configureStore} from '@reduxjs/toolkit';
import loginSlice from '../features/login/loginSlice';
import roomSlice from '../features/rooms/roomSlice';

export default  configureStore({
    reducer: {
        login: loginSlice,
        room: roomSlice,
    },
   
});

