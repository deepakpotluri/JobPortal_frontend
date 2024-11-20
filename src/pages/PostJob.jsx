import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { majorIndianCities } from '../components/SearchComponent';

const PostJob = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, authLoading } = useAuth();
  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const initialFormState = {
    jobTitle: '',
    employmentType: [],
    workMode: [],
    minPrice: '',
    maxPrice: '',
    description: '',
    rolesAndResponsibilities: '',
    experience: {
      min: '',
      max: ''
    },
    companyName: '',
    jobLocations: [], // Changed from jobLocation to jobLocations array
    companyLogo: '',
    companyUrl: '',
    status: 'active'
  };

  const [formState, setFormState] = useState(initialFormState);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState(majorIndianCities);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (user && user.role !== 'employer' && user.role !== 'admin') {
      console.log('User is not an employer or admin, redirecting to home');
      navigate('/');
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.baseURL = `${import.meta.env.VITE_BACKEND_URI}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Location filtering effect
  useEffect(() => {
    if (currentLocation === '') {
      setFilteredCities(majorIndianCities);
    } else {
      const filtered = majorIndianCities.filter(city =>
        city.toLowerCase().includes(currentLocation.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [currentLocation]);

  // Click outside effect for location suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !locationInputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatUrl = (url) => {
    if (!url) return '';
    url = url.trim().replace(/\/+$/, '');
    if (url.match(/^https?:\/\//)) return url;
    if (url.startsWith('www.')) return `https://${url}`;
    return `https://${url}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      const arrayField = name === 'employmentType' ? 'employmentType' : 'workMode';
      setFormState(prev => ({
        ...prev,
        [arrayField]: checked
          ? [...prev[arrayField], value]
          : prev[arrayField].filter(item => item !== value)
      }));
    } else if (name === 'companyUrl') {
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormState(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationKeyDown = (e) => {
    if (e.key === 'Enter' && currentLocation.trim() !== '') {
      e.preventDefault();
      addLocation(currentLocation.trim());
    }
  };

  const addLocation = (location) => {
    if (!formState.jobLocations.includes(location)) {
      setFormState(prev => ({
        ...prev,
        jobLocations: [...prev.jobLocations, location]
      }));
    }
    setCurrentLocation('');
    setShowSuggestions(false);
  };

  const removeLocation = (locationToRemove) => {
    setFormState(prev => ({
      ...prev,
      jobLocations: prev.jobLocations.filter(location => location !== locationToRemove)
    }));
  };

  const validateForm = () => {
    const minSalary = parseFloat(formState.minPrice) || 0;
    const maxSalary = parseFloat(formState.maxPrice) || 0;
    const minExp = parseFloat(formState.experience.min) || 0;
    const maxExp = parseFloat(formState.experience.max) || 0;
    
    if (minSalary < 0) {
      throw new Error('Minimum salary cannot be negative');
    }
    
    if (maxSalary < 0) {
      throw new Error('Maximum salary cannot be negative');
    }
    
    if (maxSalary < minSalary) {
      throw new Error('Maximum salary cannot be less than minimum salary');
    }
  
    if (minExp < 0) {
      throw new Error('Minimum experience cannot be negative');
    }
    
    if (maxExp < 0) {
      throw new Error('Maximum experience cannot be negative');
    }
    
    if (maxExp < minExp) {
      throw new Error('Maximum experience cannot be less than minimum experience');
    }
  
    if (formState.employmentType.length === 0) {
      throw new Error('Please select at least one employment type');
    }
  
    if (formState.workMode.length === 0) {
      throw new Error('Please select at least one work mode');
    }

    if (formState.jobLocations.length === 0) {
      throw new Error('Please select at least one job location');
    }
  
    return {
      minSalary,
      maxSalary,
      minExp,
      maxExp
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      validateForm();
      setPreview(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setPreview(false);
    setError(null);
  };

  const postJob = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const { minSalary, maxSalary, minExp, maxExp } = validateForm();
  
      const jobData = {
        jobTitle: formState.jobTitle,
        employmentType: formState.employmentType,
        workMode: formState.workMode,
        minPrice: minSalary.toString(),
        maxPrice: maxSalary.toString(),
        description: formState.description,
        companyName: formState.companyName,
        jobLocations: formState.jobLocations,
        companyLogo: formState.companyLogo || null,
        companyUrl: formState.companyUrl ? formatUrl(formState.companyUrl) : null,
        rolesAndResponsibilities: formState.rolesAndResponsibilities,
        experience: {
          min: minExp.toString(),
          max: maxExp.toString()
        },
        status: formState.status || 'active'
      };
  
      const response = await axios.post('/api/jobs', jobData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.data.success) {
        alert('Job Posted Successfully!');
        console.log('Job posted successfully:', response.data);
        resetForm();
      }
    } catch (error) {
      console.error('Error posting job:', error);
      setError(error.response?.data?.message || 'Error posting job');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {preview ? (
        <div className="border p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-bold mb-4">Job Preview</h2>
          <p className="mb-3"><strong>Job Title:</strong> {formState.jobTitle}</p>
          <p className="mb-3"><strong>Job Type:</strong> {formState.employmentType.join(', ')}</p>
          <p className="mb-3"><strong>Work Mode:</strong> {formState.workMode.join(', ')}</p>
          <p className="mb-3"><strong>Salary Range:</strong> ₹{formState.minPrice}L - ₹{formState.maxPrice}L</p>
          <p className="mb-3"><strong>Description:</strong> {formState.description}</p>
          <p className="mb-3"><strong>Roles and Responsibilities:</strong> {formState.rolesAndResponsibilities}</p>
          <p className="mb-3"><strong>Experience Range:</strong> {formState.experience.min} - {formState.experience.max} years</p>
          <p className="mb-3"><strong>Company Name:</strong> {formState.companyName}</p>
          <p className="mb-3"><strong>Work Locations:</strong> {formState.jobLocations.join(', ')}</p>
          <p className="mb-3"><strong>Company Logo URL:</strong> {formState.companyLogo || 'N/A'}</p>
          <p className="mb-3"><strong>Company URL:</strong> {formState.companyUrl || 'N/A'}</p>

          <div className="mt-6 flex gap-4">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
              onClick={() => setPreview(false)}
              disabled={loading}
            >
              Edit
            </button>
            <button
              className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={postJob}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </>
              ) : (
                'Post Job'
              )}
            </button>
          </div>
        </div>
      ) : (

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="block font-bold mb-1">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={formState.jobTitle}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Job Type</label>
            <div className="flex flex-wrap gap-4">
            {[
  'Full-time', 
  'Part-time', 
  'Contract', 
  'Internship', 
  'Freelance', 
  'Temporary'
].map((type) => (
  <label key={type} className="flex items-center space-x-2">
    <input
      type="checkbox"
      name="employmentType"
      value={type}
      checked={formState.employmentType.includes(type)}
      onChange={handleChange}
      className="form-checkbox h-4 w-4 text-indigo-600"
    />
    <span>{type}</span>
  </label>
))}
            
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Work Mode</label>
            <div className="flex flex-wrap gap-4">
              {['Remote', 'On-site', 'Hybrid', 'Work From Office'].map((mode) => (
                <label key={mode} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="workMode"
                    value={mode}
                    checked={formState.workMode.includes(mode)}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-indigo-600"
                  />
                  <span>{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Salary Range (in Lakhs)</label>
            <div className="flex space-x-4">
              <input
                type="number"
                name="minPrice"
                value={formState.minPrice}
                onChange={handleChange}
                className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Min Salary"
                min="0"
                step="0.1"
                required
              />
              <input
                type="number"
                name="maxPrice"
                value={formState.maxPrice}
                onChange={handleChange}
                className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Max Salary"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Job Description</label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows="4"
              className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            ></textarea>
          </div>

          <div>
            <label className="block font-bold mb-1">Roles and Responsibilities</label>
            <textarea
              name="rolesAndResponsibilities"
              value={formState.rolesAndResponsibilities}
              onChange={handleChange}
              rows="4"
              className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            ></textarea>
          </div>

          <div>
            <label className="block font-bold mb-1">Experience Range (in years)</label>
            <div className="flex space-x-4">
              <input
                type="number"
                name="experience.min"
                value={formState.experience.min}
                onChange={handleChange}
                className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Min Experience"
                min="0"
                step="0.5"
                required
              />
              <input
                type="number"
                name="experience.max"
                value={formState.experience.max}
                onChange={handleChange}
                className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Max Experience"
                min="0"
                step="0.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formState.companyName}
              onChange={handleChange}
              className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Job Locations</label>
            <div className="relative">
              <div className="flex flex-wrap gap-2 p-2 bg-white border rounded">
                <div>
                  <MapPin className="text-gray-500 text-xl" />
                </div>
                {formState.jobLocations.map((location, index) => (
                  <span
                    key={`location-${location}-${index}`}
                    className="bg-green-100 text-green-800 px-2 py-2 rounded flex items-center text-sm"
                  >
                    {location}
                    <X 
                      className="ml-1 cursor-pointer" 
                      size={14} 
                      onClick={() => removeLocation(location)}
                    />
                  </span>
                ))}
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder={formState.jobLocations.length === 0 ? 'Select or type locations' : ''}
                  className="flex-grow outline-none min-w-[200px]"
                  value={currentLocation}
                  onChange={(e) => {
                    setCurrentLocation(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleLocationKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                />
              </div>
              
              {showSuggestions && (
                <ul 
                  ref={suggestionsRef} 
                  className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredCities.map((city, index) => (
                    <li
                      key={`city-${city}-${index}`}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        addLocation(city);
                        setShowSuggestions(false);
                      }}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div>
            <label className="block font-bold mb-1">Company Logo URL (optional)</label>
            <input
              type="url"
              name="companyLogo"
              value={formState.companyLogo}
              onChange={handleChange}
              className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Company URL (optional)</label>
            <input
              type="text"
              name="companyUrl"
              value={formState.companyUrl}
              onChange={handleChange}
              className="input w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>



          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
            >
              Preview Job
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PostJob;
