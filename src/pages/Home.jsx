import React, { useEffect, useState } from 'react';
import SearchComponent from '../components/SearchComponent';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isFiltered, setIsFiltered] = useState(false); 
  const API_BASE_URL =`${import.meta.env.VITE_BACKEND_URI}/api`;

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      
      if (response.data.success) {
        const sortedJobs = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs);
        setError(null);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleKeywordSearch = (keywords, locations) => {
    try {
      setIsLoading(true);
      setIsFiltered(true);

      let result = [...jobs];

      if (keywords.length > 0) {
        result = result.filter(job =>
          keywords.some(keyword =>
            job.jobTitle.toLowerCase().includes(keyword.toLowerCase()) ||
            (job.description && job.description.toLowerCase().includes(keyword.toLowerCase()))
          )
        );
      }

      if (locations.length > 0) {
        result = result.filter(job =>
          locations.some(location =>
            job.jobLocation && job.jobLocation.toLowerCase().includes(location.toLowerCase())
          )
        );
      }

      setFilteredJobs(result);
    } catch (err) {
      setError('Error filtering jobs');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchJobs}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SearchComponent onKeywordSearch={handleKeywordSearch} />
      
      <div className="container mx-auto px-4 mt-8 text-gray-600">
        {isFiltered ? `${filteredJobs.length} jobs found` : 'Recently Posted'}
        {isFiltered && (
          <div className="text-blue-600 cursor-pointer underline mt-2" onClick={() => navigate('/findjob')}>
           For more Filters click here 
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 my-8">
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <div 
                  key={job._id || `job-${index}`}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/job/${job._id}`)}
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
                          {job.employmentType.map((type, index) => (
                            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                              {type}&nbsp;
                            </span>
                          ))}
                          {job.jobLocation && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {job.jobLocation}
                            </span>
                          )}
                          {job.experience.min !== undefined && job.experience.max !== undefined && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {job.experience.min} - {job.experience.max} years
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-600">
                      <p className="text-sm">Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm font-medium mt-1">
                        {job.salary.min}LPA - {job.salary.max}LPA
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No jobs found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;