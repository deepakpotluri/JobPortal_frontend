import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



const JobDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL =`${import.meta.env.VITE_BACKEND_URI}/api`;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchJobs(token);
  }, [navigate]);

  const fetchJobs = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/my-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setJobs(response.data.data);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError("Failed to fetch jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this job?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/jobs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setJobs(jobs.filter(job => job._id !== id));
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert("You are not authorized to delete this job");
      } else {
        alert("Failed to delete job");
      }
    }
  };

  const handleViewApplications = (id) => {
    navigate(`/jobs/${id}/applications`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Posted Jobs</h1>
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">You haven't posted any jobs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job, index) => (
            <div 
              key={job._id || `job-${index}`}
              className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewApplications(job._id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {job.companyLogo && (
                    <img 
                      src={job.companyLogo} 
                      alt={job.companyName} 
                      className="w-10 h-10 object-contain"
                    />
                  )}
                  <div className="max-w-xs">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {job.jobTitle}
                    </h3>
                    <p className="text-gray-600 mt-1 truncate">
                      {job.companyName}
                    </p>
                    <div className="text-xs mt-2 flex flex-wrap gap-2">
                      {Array.isArray(job.employmentType) && job.employmentType.map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                      {job.jobLocation && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {job.jobLocation}
                        </span>
                      )}
                      {job.experience?.min !== undefined && job.experience?.max !== undefined && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {job.experience.min} - {job.experience.max} years
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-gray-600">
                  <p className="text-sm">Posted: {new Date(job.createdAt || job.postingDate).toLocaleDateString()}</p>
                  <p className="text-sm font-medium mt-1">
                    {job.salary?.min || job.minPrice}LPA - {job.salary?.max || job.maxPrice}LPA
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteJob(job._id);
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobDashboard;