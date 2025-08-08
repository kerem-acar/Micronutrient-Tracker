import React from "react";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import api from './api'

function Login() {
    
    const initialFormState = {
        username: '',
        password: ''
    };
    
    const [formData, setFormData] = useState(initialFormState)
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };
        
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (!formData.password || !formData.username) {
            setError("All fields are required")
            setShowError(true);
            setIsLoading(false);
            return;
        }
        
        try{
            const dataToSend = new URLSearchParams();
            dataToSend.append('username', formData.username);
            dataToSend.append('password', formData.password);
            const postResponse = await api.post("/token", dataToSend);
            setFormData(initialFormState);
            setShowSuccess(true);
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.detail){
                setError(error.response.data.detail)
            }
            else {
                setError("An unexpected error occurred")
            }
            setShowError(true);
            setFormData(initialFormState);
        }
        finally {
            setIsLoading(false);
        }
    };
    
    return(
         <div className="bg-gray-700 min-h-screen pb-10 sm:pb-20">
            <nav className="absolute top-0 left-0 p-4">
                <ul>
                    <li>
                        <Link to="/" className="text-white font-sans text-xl font-medium hover:text-amber-200 sm:text-2xl lg:text-4xl">Home</Link>
                    </li>
                </ul>
            </nav>
            <div className={`fixed inset-0 flex items-center justify-center z-50 ${!showError ? 'hidden': ''}`}>
                <div className="bg-gray-600 rounded-lg shadow-md p-6 m-4 text-center sm:p-10 sm:m-0">
                    <h2 className="text-red-500 font-medium font-sans text-xl pb-3 sm:text-2xl md:text-3xl">{error}</h2>
                    <div className="flex justify-center">                        
                        <button onClick={() => setShowError(false)} className="w-auto py-1 px-8 bg-blue-600 rounded-md text-white font-sans font-medium cursor-pointer hover:bg-blue-500">Ok</button>
                    </div>
                </div>
            </div>
            <div className={`fixed inset-0 flex items-center justify-center z-50 ${!showSuccess ? 'hidden': ''}`}>
                <div className="bg-gray-600 rounded-lg shadow-md p-6 m-4 text-center sm:p-10 sm:m-0">
                    <h2 className="text-white font-medium font-sans text-xl pb-3 sm:text-2xl md:text-3xl">Welcome!</h2>
                    <div className="flex justify-center">                        
                        <Link to="/" className="w-auto py-1 px-8 bg-blue-600 rounded-md text-white font-sans font-medium cursor-pointer hover:bg-blue-500">Ok</Link>     
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <h2 className="font-sans text-white font-bold text-2xl pt-16 text-center sm:text-3xl sm:pt-28">Sign in to your account</h2>
            </div>
            <div className="mt-5 mx-auto w-full max-w-sm px-4 sm:px-0">
                <form className="bg-gray-800 p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-white font-medium font-sans text-lg sm:text-x">Username</label> 
                    </div>
                    <div>
                        <input name="username" value={formData.username} onChange={handleChange} className="block w-full bg-gray-600 rounded-md mt-2 px-3 py-1.5 text-white focus:outline-2 focus:outline-blue-600"></input>
                    </div>
                    <div className="mt-3">
                        <label className="text-white font-medium font-sans text-lg sm:text-x">Password</label> 
                    </div>
                    <div>
                        <input name="password" value={formData.password} onChange={handleChange} type="password" className="block w-full bg-gray-600 rounded-md mt-2 px-3 py-1.5 text-white focus:outline-2 focus:outline-blue-600"></input>
                    </div>
                    <div className="mt-5">
                        <button type="submit" disabled={isLoading} className={`flex w-full justify-center ${isLoading ? 'bg-blue-500': 'bg-blue-600'} rounded-md py-1.5 px-3 text-white font-sans font-medium cursor-pointer hover:bg-blue-500`}>{isLoading ? 'Signing in...': 'Sign in'}</button>
                    </div>
                </form>                
            </div>
        </div>
    )
}






export default Login;