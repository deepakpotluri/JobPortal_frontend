import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add registration function
  const register = async (userData) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return { success: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const { success, error } = await login({
          email: formData.email,
          password: formData.password
        });

        if (success) {
          setSuccess('Login successful!');
          navigate(from, { replace: true });
        } else {
          setError(error || 'Incorrect email or password. Please try again.');
        }
      } else {
        // Prepare registration data
        const registrationData = {
          email: formData.email,
          password: formData.password,
          role: formData.role
        };

        // Only add companyName if role is employer
        if (formData.role === 'employer') {
          registrationData.companyName = formData.companyName;
        }

        const { success } = await register(registrationData);

        if (success) {
          setSuccess('Registration successful! Please log in.');
          setIsLoginMode(true);
          setFormData({
            email: '',
            password: '',
            role: 'user',
            companyName: ''
          });
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLoginMode ? 'Login' : 'Register'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {!isLoginMode && (
            <>
              <div>
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">Job Seeker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>

              {formData.role === 'employer' && (
                <div>
                  <label className="block text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              isLoginMode ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError('');
            setSuccess('');
            setFormData({
              email: '',
              password: '',
              role: 'user',
              companyName: ''
            });
          }}
          className="w-full mt-4 text-indigo-600 hover:text-indigo-700"
        >
          {isLoginMode ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;