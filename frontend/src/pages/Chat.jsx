import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { setRooms, setCurrentRoom } from "../features/rooms/roomSlice";



const Chat = () => {

    const [message, setMessage] = useState("");
    const [receviedmessages, setReceivedMessages] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.emit("message", { message });
        setMessage("");
    }


    const socket = useMemo(() => io('http://localhost:5000', {
        autoConnect: false,
    }), []);
    console.log("socket", socket);
    localStorage.setItem("socket", socket.id);

    // const dispatch = useDispatch();

    // const room = useSelector((state) => state.room.rooms);


    useEffect(() => {
        socket.connect();
        socket.on("connect", () => {
            console.log("Connected to server with ID:", socket.id);
            // dispatch(setRooms(socket.id));
            // dispatch(setCurrentRoom(socket.id));
        });

        socket.on('message received', (data) => {
            // console.log(data);
          setReceivedMessages((receviedmessages) => [...receviedmessages, data]);  
        }
        );

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className='w-full h-screen bg-black'>
            <div className='flex justify-center items-center h-1/4'>
                <h1 className='text-white text-3xl'>WELCOME TO SOCKET IO</h1>
            </div>
            <div className='w-full flex flex-col justify-center items-center '>
                <form onSubmit={handleSubmit} >
                    <label className='text-white text-2xl mt-5 block'>Message</label>
                    <input
                        type="text"
                        placeholder="Enter your message"
                        name='message'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className='w-100 h-15 mt-5 border-2 text-white border-white border-solid rounded-md p-2'
                    />
                    <div>

                        <button type="submit" className='text-white text-2xl border-2 rounded-xl mt-5 p-2 bg-green-400 hover:text-3xl'>Send</button>
                    </div>
                </form>

                <div className='w-full h-100 flex flex-col justify-center items-center'>
                    <h1 className='text-white text-2xl mt-5 '>Messages</h1>
                    <div className='h-full w-full flex flex-col items-center'>
                        {receviedmessages.map((message, index) => (
                            <div key={index} className='text-white text-2xl mt-5'>{message.message}</div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Chat;
