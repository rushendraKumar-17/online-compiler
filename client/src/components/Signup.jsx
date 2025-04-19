import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AppContext from '../context/Context';

const Signup = () => {
    const navigate = useNavigate();
    const {apiUrl} = useContext(AppContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const {user,setUser} = useContext(AppContext);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/api/user/register`, formData);
            if(response.status == 201){
                setUser(response.data.user);
                navigate("/home");
            }else{
                alert("Error in signing up");
                console.log(response);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    Sign Up
                </button>
                <div className='text-center mt-[1vh]'><p>Already have an account? <Link to="/login" className='text-indigo-600 hover:text-indigo-500 '>Login</Link></p></div>
            </form>
        </div>
    );
};

export default Signup;