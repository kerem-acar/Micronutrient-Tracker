import React from "react";
import { useState } from "react";
import axios from 'axios';
import { Link } from "react-router";
import api from './api'

function Register() {
    
    const initialFormState = {
        username: '',
        password: '',
        age: '',
        gender: ''
    };
    
    const [formData, setFormData] = useState(initialFormState)
    const [isLoading, setIsLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);
    const [welcome, setWelcome] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
        setError(null);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        if (!formData.username || !formData.password || !formData.age || !formData.gender) {
            setError("All fields are required");
            setIsLoading(false);
            setShowError(true);
            return;
        }
        
        const user_age = parseFloat(formData.age)
        

        if (!Number.isInteger(user_age) || user_age < 1 || user_age > 120) {
            setError("Please enter a valid age")
            setIsLoading(false);
            setShowError(true);
            return;
        }

        if (formData.username.length < 5) {
            setError("Username must be at least 5 characters long")
            setIsLoading(false);
            setShowError(true);
            return;
        }

        try{
            const postResponse = await api.post("/users/", formData)
            setWelcome(postResponse.data.message)
            setShowWelcome(true);
            setFormData(initialFormState);
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail)
            }
            else {
                setError("An unexpected error occurred. Please try again.")
            }
            setShowError(true);
        }
        finally{
            setIsLoading(false);
        }
    };



    return(
        <div className="bg-gray-700 min-h-screen pb-10 sm:pb-20">
            <div className="flex justify-center">
                <h2 className="font-sans text-white font-bold text-2xl pt-16 text-center sm:text-3xl sm:pt-28">Create an account</h2>
            </div>
            <nav className="absolute top-0 left-0 p-4">
                <ul>
                    <li>
                        <Link to="/" className="text-white font-sans text-xl font-medium hover:text-amber-200 sm:text-2xl lg:text-4xl">Home</Link>
                    </li>
                </ul>
            </nav>
            <div className={`fixed inset-0 flex items-center justify-center z-50 ${!showWelcome ? 'hidden': ''}`}>
                <div className="bg-gray-600 rounded-lg shadow-md p-6 m-4 text-center sm:p-10 sm:m-0">
                    <h2 className="text-white font-medium font-sans text-xl pb-3 sm:text-2xl md:text-3xl">{welcome}</h2>
                    <div className="flex justify-center">                        
                        <Link to="/" className="w-auto py-1 px-8 bg-blue-600 rounded-md text-white font-sans font-medium cursor-pointer hover:bg-blue-500">Ok</Link>     
                    </div>
                </div>
            </div>
            <div className={`fixed inset-0 flex items-center justify-center z-50 ${!showError ? 'hidden': ''}`}>
                <div className="bg-gray-600 rounded-lg shadow-md p-6 m-4 text-center sm:p-10 sm:m-0">
                    <h2 className="text-red-500 font-medium text-xl pb-3 sm:text-2xl md:text-3xl">{error}</h2>
                    <div className="flex justify-center">                        
                        <button onClick={() => setShowError(false)} className="w-auto py-1 px-8 bg-blue-600 rounded-md text-white font-sans font-medium cursor-pointer hover:bg-blue-500">Ok</button>
                    </div>
                </div>
            </div>
            <div className="mt-5 mx-auto w-full max-w-sm px-4 sm:px-0">
                <form className="bg-gray-800 p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-white font-medium font-sans text-lg sm:text-xl">Username</label> 
                    </div>
                    <div>
                        <input name="username" value={formData.username} onChange={handleChange} className="block w-full bg-gray-600 rounded-md mt-2 px-3 py-1.5 text-white focus:outline-2 focus:outline-blue-600"></input>
                    </div>
                    <div className="mt-3">
                        <label className="text-white font-medium font-sans text-lg sm:text-xl">Password</label> 
                    </div>
                    <div>
                        <input name="password" value={formData.password} onChange={handleChange} type="password" className="block w-full bg-gray-600 rounded-md mt-2 px-3 py-1.5 text-white focus:outline-2 focus:outline-blue-600"></input>
                    </div>
                    <div className="mt-3">
                        <label className="text-white font-medium font-sans text-lg sm:text-xl">Age</label> 
                    </div>
                    <div>
                        <input name="age" type="number" value={formData.age} onChange={handleChange} className="block w-full bg-gray-600 rounded-md mt-2 px-3 py-1.5 text-white focus:outline-2 focus:outline-blue-600"></input>
                    </div>
                    <div className="mt-3">
                        <label className="text-white font-medium font-sans text-lg sm:text-xl">Gender</label>
                    </div>
                    <div className="flex flex-col mt-3 space-y-1">
                        <div className="flex items-center space-x-1">
                            <input className="h-3 w-3" type="radio" id="male" name="gender" value="MALE" onChange={handleChange} checked={formData.gender === 'MALE'}></input>
                            <label className="text-white font-medium font-sans text-base" htmlFor="male">Male</label>
                        </div>
                        <div className="flex items-center space-x-1">
                            <input className="h-3 w-3" type="radio" id="female" name="gender" value="FEMALE" onChange={handleChange} checked={formData.gender === 'FEMALE' }></input>
                            <label className="text-white font-medium font-sans text-base" htmlFor="female">Female</label>
                        </div>
                    </div>
                    <div className="mt-5">
                        <button type="submit" disabled={isLoading} className={`flex w-full justify-center ${isLoading ? 'bg-blue-500' : 'bg-blue-600'} rounded-md py-1.5 px-3 text-white font-sans font-medium cursor-pointer hover:bg-blue-500`}>{isLoading ? 'Registering...' : 'Register'}</button>
                    </div>
                </form>                
            </div>
        </div>
    )
};

export default Register;