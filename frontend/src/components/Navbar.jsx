import React from 'react';
import { Home, User, Video, MessageCircle } from 'lucide-react';
import GoogleAuth from '../components/GoogleAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLoginSuccess = (user) => {
    // console.log("User Logged In:", user);
  };
  
  // Check if current path is /chats - if so, don't render the navbar
  if (location.pathname === '/chats') {
    return null;
  }
  
  return (
    <>
      <div className='fixed top-10 right-10'>
        {/* <button>
          <GoogleAuth onLoginSuccess={handleLoginSuccess} />
        </button> */}
      </div>
      <div className="fixed bottom-0 left-0 right-0 pb-4 px-2 z-50">
        <nav className="max-w-lg mx-auto rounded-full bg-gradient-to-r from-[rgb(26,54,54)] to-gray-800 shadow-lg p-2">
          <div className="flex justify-between items-center">
            <a href="/" className="flex flex-col items-center p-3 text-white hover:text-blue-500 transition-colors">
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </a>
            
            <p onClick={()=>navigate('/chats')} className="flex flex-col items-center p-3 text-white hover:text-blue-500 transition-colors">
              <MessageCircle size={24} />
              <span className="text-xs mt-1">Chats</span>
            </p>
            
            <a href="/call" className="flex flex-col items-center p-3 text-white hover:text-blue-500 transition-colors">
              <Video size={24} />
              <span className="text-xs mt-1">Call</span>
            </a>
            
            <a href="#" className="flex flex-col items-center p-3 text-white hover:text-blue-500 transition-colors">
              <User size={24} />
              <span className="text-xs mt-1">Profile</span>
            </a>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;