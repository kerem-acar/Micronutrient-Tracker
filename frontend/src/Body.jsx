import React from "react"
import { useState, useEffect } from "react";
import axios from "axios";
import api from './api';

function Body() {
    
    const initialFormState = {
        description: "",
        size: "",
        unit: ""
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [rdaData, setRdaData] = useState({})
    const [nutrientData, setNutrientData] = useState({})
    const [doFetch, setDoFetch] = useState(true);
    const [showError, setShowError] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading1, setIsLoading1] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null);
        setIsLoading(true);

        if (!formData.description || !formData.size || !formData.unit) {
            setError("All fields are required")
            setIsLoading(false);
            setShowError(true);
            setFormData(initialFormState);
            return;
        }
        try{
            const patchResponse = await api.patch('/users/', formData)
            setFormData(initialFormState);
            setDoFetch(true);
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail)
            } else {
                setError("An unexpected error occurred")
            }
            setShowError(true);
        }
        finally{
            setIsLoading(false);
            setFormData(initialFormState);
        }
    };
    

    useEffect(() => {
        const getUserData = async () => {
            try{
                const getResponse = await api.get('/users/me/');
                const userData = getResponse.data
                const fetchedRdaData = userData.nutrient_rdas
                setRdaData(fetchedRdaData)
            }
            catch{
                console.log("Error fetching user data")
            }
        };

        getUserData();
    }, []);

    useEffect(() => {

        if (!doFetch) return;
        
        const getNutrientData = async () => {
            try{
                const response = await api.get('/users/me/');
                const data = response.data
                const fetchedNutrientData = data.nutrient_current
                setNutrientData(fetchedNutrientData)
            }
        
            catch{
                console.log("Error fetching user data")
            }
            finally{
                setDoFetch(false);
            }
        };
        getNutrientData();
    }, [doFetch]);

    const getPercentage = (value1, value2) => {
        try{const result = (value1 / value2) * 100
            if (isNaN(result) || !isFinite(result)) {
                return 0;
            }
            return Number(result.toFixed(2));
        }
        catch{
            return 0;
        }
    };

    const resetVitamins = async () => {
        setError(null);
        setIsLoading1(true);
        try{
            const reset = await api.put('/users_vitamins/', {});
            setDoFetch(true);
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail)
            } else {
                setError("An unexpected error occurred")
            }
            setShowError(true);
        }
        finally{
            setIsLoading1(false);
        }
    };

    const resetMinerals = async () => {
        setError(null);
        setIsLoading2(true);
        try{
            const reset = await api.put('/users_minerals/', {});
            setDoFetch(true);
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail)
            } else {
                setError("An unexpected error occurred")
            }
            setShowError(true);
        }
        finally{
            setIsLoading2(false);
        }
    };

    const nutrients = [
        { name: "Vitamin A", key: "vitamin_a", unit: "ug", type: "vitamin" },
        { name: "Vitamin B1", key: "vitamin_b1", unit: "mg", type: "vitamin" },
        { name: "Vitamin B3", key: "vitamin_b3", unit: "mg", type: "vitamin" },
        { name: "Vitamin B5", key: "vitamin_b5", unit: "mg", type: "vitamin" },
        { name: "Vitamin B6", key: "vitamin_b6", unit: "mg", type: "vitamin" },
        { name: "Vitamin B7", key: "vitamin_b7", unit: "ug", type: "vitamin" },
        { name: "Vitamin B9", key: "vitamin_b9", unit: "mg", type: "vitamin" },
        { name: "Vitamin B12", key: "vitamin_b12", unit: "ug", type: "vitamin" },
        { name: "Vitamin C", key: "vitamin_c", unit: "ug", type: "vitamin" },
        { name: "Vitamin D", key: "vitamin_d", unit: "ug", type: "vitamin" },
        { name: "Vitamin E", key: "vitamin_e", unit: "mg", type: "vitamin" },
        { name: "Vitamin K", key: "vitamin_k", unit: "ug", type: "vitamin" },
        { name: "Calcium", key: "calcium", unit: "mg", type: "mineral" },
        { name: "Copper", key: "copper", unit: "ug", type: "mineral" },
        { name: "Chromium", key: "chromium", unit: "ug", type: "mineral" },
        { name: "Iron", key: "iron", unit: "mg", type: "mineral" },
        { name: "Iodine", key: "iodine", unit: "ug", type: "mineral" },
        { name: "Magnesium", key: "magnesium", unit: "mg", type: "mineral" },
        { name: "Manganese", key: "manganese", unit: "mg", type: "mineral" },
        { name: "Molybdenum", key: "molybdenum", unit: "ug", type: "mineral" },
        { name: "Potassium", key: "potassium", unit: "mg", type: "mineral" },
        { name: "Phosphorus", key: "phosphorus", unit: "mg", type: "mineral" },
        { name: "Selenium", key: "selenium", unit: "ug", type: "mineral" },
        { name: "Sodium", key: "sodium", unit: "mg", type: "mineral" },
        { name: "Zinc", key: "zinc", unit: "mg", type: "mineral" },
    ];

    const vitamins = nutrients.filter(n => n.type === 'vitamin')
    const minerals = nutrients.filter(n => n.type === 'mineral')

    return(
        <div className="bg-gray-700 min-h-screen overflow-auto">        
            <div className={`fixed inset-0 flex items-center justify-center z-50 ${!showError ? 'hidden': ''}`}>
                <div className="bg-gray-600 rounded-lg shadow-md p-10">
                    <h2 className="text-red-500 font-medium font-sans text-3xl pb-3">{error}</h2>
                    <div className="flex justify-center">
                        <button onClick={() => setShowError(false)} className="w-20 py-1 px-2 bg-blue-600 rounded-md text-white font-sans font-medium cursor-pointer hover:bg-blue-500">Ok</button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:space-x-40 p-10 pt-10 md:p-15 lg:p-20 justify-center">
                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm mb-6 lg:mb-auto">
                    <div>
                        <label className="block text-white font-medium font-sans text-xl">Food Description</label> 
                    </div>
                    <div>
                        <input name="description" value={formData.description} onChange={handleChange} className="block w-full bg-gray-600 rounded-md mt-2 px-3 py-1.5 text-white focus:outline-2 focus:outline-blue-600"></input>
                    </div>
                    <div className="mt-3">
                        <label className="block text-white font-medium font-sans text-xl">Serving Size</label> 
                    </div>
                    <div>
                        <input name="size" type="number" value={formData.size} onChange={handleChange} className="block w-full bg-gray-600 rounded-md mt-2 px-3 py-1.5 text-white focus:outline-2 focus:outline-blue-600"></input>
                    </div>
                    <div className="flex flex-col mt-3">
                        <div className="flex items-center space-x-1">
                            <input className="h-3 w-3" type="radio" id="grams" name="unit" value="GRAMS" onChange={handleChange} checked={formData.unit === 'GRAMS'}></input>
                            <label className="text-white font-medium font-sans text-base" htmlFor="grams">Grams</label>
                        </div>
                        <div className="flex items-center space-x-1">
                            <input className="h-3 w-3" type="radio" id="ounces" name="unit" value="OUNCES" onChange={handleChange} checked={formData.unit === 'OUNCES' }></input>
                            <label className="text-white font-medium font-sans text-base" htmlFor="ounces">Ounces</label>
                        </div>
                        <div className="flex items-center space-x-1">
                            <input className="h-3 w-3" type="radio" id="milliliters" name="unit" value="MILLILITERS" onChange={handleChange} checked={formData.unit === 'MILLILITERS' }></input>
                            <label className="text-white font-medium font-sans text-base" htmlFor="milliliters">Milliliters</label>
                        </div>
                        <div className="flex items-center space-x-1">
                            <input className="h-3 w-3" type="radio" id="cups" name="unit" value="CUPS" onChange={handleChange} checked={formData.unit === 'CUPS' }></input>
                            <label className="text-white font-medium font-sans text-base" htmlFor="cups">Cups</label>
                        </div>
                    </div>
                    <div className="mt-5">
                        <button type="submit" disabled={isLoading} className={`block w-full ${isLoading ? 'bg-blue-500': 'bg-blue-600'} rounded-md py-1.5 px-3 text-white font-sans font-medium cursor-pointer hover:bg-blue-500`}>{isLoading ? 'Tracking...' : 'Track'}</button>
                    </div>
                </form>
                <div className="flex justify-around w-full">   
                    <div className="rounded-lg shadow-md bg-gray-800 w-1/2 overflow-x-hidden mx-2">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th colSpan="3" className="text-white font-sans font-bold text-xl px-2 py-2 md:text-2xl md:px-6">Vitamins</th>
                                </tr>
                                <tr>
                                    <th className="text-white font-sans font-bold text-lg px-6 py-2 md:text-xl md:px-10">Name</th>
                                    <th className="text-white font-sans font-bold text-lg px-6 py-2 md:text-xl md:px-10">Progress</th>
                                    <th className="text-white font-sans font-bold text-lg px-6 py-2 md:text-xl md:px-10">Goal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vitamins.map((vitamins, index) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap text-white font-sans font-medium text-md px-6 py-2 md:text-lg md:px-10">{vitamins.name}</td>
                                        <td className="whitespace-nowrap text-white font-sans font-medium text-md px-6 py-2 md:text-lg md:px-10">{`${getPercentage(nutrientData[vitamins.key], rdaData[vitamins.key])}%`}</td>
                                        <td className="whitepsace-nowrap text-white font-sans font-medium text-md px-6 py-2 md:text-lg md:px-10">{`${rdaData[vitamins.key] || ""} ${vitamins.unit}`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-center py-6">
                            <button onClick={resetVitamins} disabled={isLoading1} className={`w-30 ${isLoading1 ? 'bg-blue-500' : 'bg-blue-600'} rounded-md py-1.5 px-3 text-white font-sans font-medium cursor-pointer hover:bg-blue-500`}>{isLoading1 ? 'Resetting...' : 'Reset'}</button>
                        </div>
                    </div>
                    <div className="rounded-lg shadow-md bg-gray-800 w-1/2 overflow-x-hidden mx-2">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th colSpan="3" className="text-white font-sans font-bold text-xl px-4 py-2 md:text-2xl md:px-8">Minerals</th>
                                </tr>
                                <tr>
                                    <th className="text-white font-sans font-bold text-lg px-6 py-2 md:text-xl md:px-10">Name</th>
                                    <th className="text-white font-sans font-bold text-lg px-6 py-2 md:text-xl md:px-10">Progress</th>
                                    <th className="text-white font-sans font-bold text-lg px-6 py-2 md:text-xl md:px-10">Goal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {minerals.map((minerals, index) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap text-white font-sans font-medium text-md px-6 py-2 md:text-lg md:px-10">{minerals.name}</td>
                                        <td className="whitespace-nowrap text-white font-sans font-medium text-md px-6 py-2 md:text-lg md:px-10">{`${getPercentage(nutrientData[minerals.key], rdaData[minerals.key])}%`}</td>
                                        <td className="whitespace-nowrap text-white font-sans font-medium text-md px-6 py-2 md:text-lg md:px-10">{`${rdaData[minerals.key] || ""} ${minerals.unit}`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-center py-6">
                            <button onClick={resetMinerals} disabled={isLoading2} className={`w-30 ${isLoading2 ? 'bg-blue-500' : 'bg-blue-600'} rounded-md py-1.5 px-3 text-white font-sans font-medium cursor-pointer hover:bg-blue-500`}>{isLoading2 ? 'Resetting...' : 'Reset'}</button>
                        </div>
                    </div>
                </div> 
            </div>
        </div>
    )
};

export default Body;