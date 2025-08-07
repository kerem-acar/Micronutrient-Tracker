import { React, useState } from "react"
import { Link } from "react-router";
import api from "./api"

function Header() {
    
    const [showLogout, setShowLogout] = useState(false);
    const [message, setMessage] = useState('');


    const handleLogout = async() => {
        try{
            const response = await api.post("/logout", {})
            setMessage(response.data.message)
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setMessage(error.response.data.detail)
            }
            else {
                setMessage("An unexepected error occurred")
            }
        }
        finally{
            setShowLogout(true);
        }
    };
    
    return(
        <header className="bg-gray-700 relative">
            <div className="flex justify-center pt-20">
                <h1 className="font-sans text-6xl text-white font-bold">Micronutrient Tracker</h1>
            </div>
            <div className={`fixed inset-0 flex items-center justify-center z-50 ${!showLogout ? 'hidden': ''}`}>
                <div className="bg-gray-600 rounded-lg shadow-md p-10">
                    <h2 className="text-white font-medium font-sans text-3xl pb-3">{message}</h2>
                    <div className="flex justify-center">                        
                        <button onClick={() => setShowLogout(false)} className="w-auto py-1 px-8 bg-blue-600 rounded-md text-white font-sans font-medium cursor-pointer hover:bg-blue-500">Ok</button>
                    </div>
                </div>
            </div>
            <nav className="absolute top-0 right-0 py-4 px-16">
                <ul className="flex space-x-8">
                    <li>
                        <Link to="/register" className="text-white font-sans text-4xl font-medium hover:text-amber-200">Register</Link>
                    </li>
                    <li>
                        <Link to="/login" className="text-white font-sans text-4xl font-medium hover:text-amber-200">Login</Link>
                    </li>
                    <li>
                        <button onClick={handleLogout} className="text-white font-sans text-4xl font-medium hover:text-amber-200 cursor-pointer">Logout</button>
                    </li>
                </ul>
            </nav>
        </header>
    )
};

export default Header;