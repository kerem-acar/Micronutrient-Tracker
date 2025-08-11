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
    
    const handleClose = () => {
        setShowLogout(false);
        window.location.reload();
    }

    return(
        <header className="bg-gray-700 relative">
            <div className="flex justify-center pt-15 lg:pt-20">
                <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold">Github Actions CI/CD Test</h1>
            </div>
            <div className={`fixed inset-0 flex items-center justify-center z-50 ${!showLogout ? 'hidden': ''}`}>
                <div className="bg-gray-600 rounded-lg shadow-md p-10 text-center">
                    <h2 className="text-white font-medium font-sans text-xl sm: text-2xl md:text-3xl pb-3">{message}</h2>
                    <div className="flex justify-center">                        
                        <button onClick={handleClose} className="w-auto py-1 px-8 bg-blue-600 rounded-md text-white font-sans font-medium cursor-pointer hover:bg-blue-500">Ok</button>
                    </div>
                </div>
            </div>
            <nav className="absolute top-0 right-0 p-4 lg:py-4 lg:px-16">
                <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-8 items-end">
                    <li>
                        <Link to="/register" className="text-white font-sans text-lg sm:text-xl md:text-2xl lg:text-4xl font-medium hover:text-amber-200">Register</Link>
                    </li>
                    <li>
                        <Link to="/login" className="text-white font-sans text-lg sm:text-xl md:text-2xl lg:text-4xl font-medium hover:text-amber-200">Login</Link>
                    </li>
                    <li>
                        <button onClick={handleLogout} className="text-white font-sans text-lg sm:text-xl md:text-2xl lg:text-4xl font-medium hover:text-amber-200 cursor-pointer">Logout</button>
                    </li>
                </ul>
            </nav>
        </header>
    )
};

export default Header;