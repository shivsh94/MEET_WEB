import React, { useState, useEffect, useRef } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../features/login/loginSlice';
import axios from "axios";

const clientId = "761866040295-6okd1osajvah2m631joo5h5eldm04omu.apps.googleusercontent.com";

const GoogleAuth = ({ onLoginSuccess }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.login.currentUser);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogin = async (credentialResponse) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // const response = await axios.post(
            //     "http://localhost:3000/auth/google",
            //     { token: credentialResponse.credential },
            //     { withCredentials: true }
            // );
            
            // const userData = {
            //     ...response.data.user,
            //     token: response.data.token
            // };
            // console.log("userData",userData);

            if(response.data.success){
                dispatch(login(response.data));
                localStorage.setItem("token", JSON.stringify(response.data.token));
                localStorage.setItem("user", JSON.stringify(response.data.user));
                window.location.reload();
            }
            
            // console.log("response",response.data.user);
            if (onLoginSuccess) {
                onLoginSuccess(response.data.success);
            }
            
            setIsLoading(false);
        } catch (err) {
            setError("Login Failed. Please try again.");
            setIsLoading(false);
        }
    };


    const handleLogout = async () => {
        try {
            setIsLoading(true);
    
            await axios.post("http://localhost:3000/auth/logout", {}, { withCredentials: true });
            
            dispatch(logout());
    
            if (onLoginSuccess) {
                onLoginSuccess(null);
            }
    
            setShowDropdown(false);
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-full">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {currentUser ? (
                    <div className="relative inline-block">
                        <div 
                            className="relative cursor-pointer transition-transform duration-300 hover:scale-105"
                            onClick={toggleDropdown}
                        >
                            <img
                                src={currentUser.profilePicture}
                                alt="Profile"
                                className="w-15 h-15 rounded-full object-cover border-2 border-transparent hover:border-blue-400 transition-all duration-200 shadow-md"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-white transform scale-0 animate-ping-once"></div>
                        </div>
                        
                        {/* Dropdown menu with animation - positioned BELOW the profile picture */}
                        {showDropdown && (
                            <div 
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-30 text-white rounded-md shadow-lg z-20 origin-top-right animate-dropdown"
                                style={{
                                    animation: 'fadeInDown 0.2s ease-out forwards',
                                    top: '100%' // Position it at 100% of the parent's height
                                }}
                            >
                                <div className="p-2">
                                    <p
                                        onClick={handleLogout}
                                        className="w-full py-2 px-2 text-left rounded text-sm text-white font-bold hover:bg-gray-700  transition-colors duration-150 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleLogin}
                            onError={() => setError("Login Failed")}
                            useOneTap={false}
                            flow="implicit"
                            theme="filled_blue"
                            size="medium"
                            text="signin_with"
                            shape="circle"
                        />
                    </div>
                )}
            </div>

            
            <style jsx="true" global = "true">{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes ping-once {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                .animate-ping-once {
                    animation: ping-once 0.8s ease-out forwards;
                }
            `}</style>
        </GoogleOAuthProvider>  
    );
};

export default GoogleAuth;