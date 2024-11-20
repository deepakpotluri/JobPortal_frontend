import React, { useState, useEffect } from 'react';
import SearchComponent from '../components/SearchComponent';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import axios from 'axios';

const jobTypes = [
  { id: 1, name: 'Full-time', value: 'Full-time' },
  { id: 2, name: 'Part-Time', value: 'Part-time' },
  { id: 3, name: 'Temporary', value: 'Temporary' },
  { id: 4, name: 'Remote', value: 'Remote' },
  { id: 5, name: 'Internship', value: 'Internship' }
];

const LocationBadges = ({ locations }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayLimit = 2;
  
  if (!locations || locations.length === 0) return null;
  
  const displayLocations = isExpanded ? locations : locations.slice(0, displayLimit);
  const remainingCount = locations.length - displayLimit;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MapPin className="h-4 w-4 text-gray-500" />
      {displayLocations.map((location, index) => (
        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
          {location}
        </span>
      ))}
      {!isExpanded && remainingCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          +{remainingCount} more
        </button>
      )}
    </div>
  );
};

const FindJob = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL =`${import.meta.env.VITE_BACKEND_URI}/api`;

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      
      if (response.data.success) {
        const sortedJobs = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs);
        setError(null);
      } else {
        setError('Failed to fetch jobs');
        setJobs([]);
        setFilteredJobs([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filterJobs = (currentKeywords, currentJobTypes, currentLocations) => {
    try {
      setIsLoading(true);

      let filtered = [...jobs];

      if (currentKeywords.length > 0) {
        filtered = filtered.filter(job =>
          currentKeywords.some(keyword =>
            job.jobTitle.toLowerCase().includes(keyword.toLowerCase()) ||
            job.description?.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }

      if (currentJobTypes.length > 0) {
        filtered = filtered.filter(job =>
          currentJobTypes.some(type =>
            job.employmentType && (
              Array.isArray(job.employmentType)
                ? job.employmentType.some(t => t.toLowerCase() === type.toLowerCase())
                : job.employmentType.toLowerCase() === type.toLowerCase()
            )
          )
        );
      }

      if (currentLocations.length > 0) {
        filtered = filtered.filter(job =>
          currentLocations.some(location =>
            job.jobLocations && job.jobLocations.some(jobLocation =>
              jobLocation.toLowerCase().includes(location.toLowerCase())
            )
          )
        );
      }

      setFilteredJobs(filtered);
    } catch (error) {
      setError('Error filtering jobs');
      setFilteredJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobTypeChange = (jobType) => {
    setSelectedJobTypes(prev => {
      const newSelection = prev.includes(jobType)
        ? prev.filter(type => type !== jobType)
        : [...prev, jobType];

      filterJobs(keywords, newSelection, locations);
      return newSelection;
    });
  };

  const handleKeywordSearch = (currentKeywords, currentLocations) => {
    setKeywords(currentKeywords);
    setLocations(currentLocations);
    filterJobs(currentKeywords, selectedJobTypes, currentLocations);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Jobs</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchJobs}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          Loading jobs...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Find Your Dream Job</h1>
          <h2 className="text-xl opacity-90">Discover opportunities that match your experience and aspirations</h2>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-20 -mt-10">
        <SearchComponent 
          onKeywordSearch={handleKeywordSearch}
          isJobPage={true}
        />
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg p-2 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Job Type</h3>
          <div className="flex flex-wrap gap-4">
            {jobTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleJobTypeChange(type.value)}
                className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                  selectedJobTypes.includes(type.value)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-600 hover:text-indigo-600'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <p className="text-gray-600">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
        </p>
      </div>

      <div className="container mx-auto px-4 my-8">
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <p className="text-gray-600">No jobs found matching your criteria.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/job/${job._id}`)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex items-start gap-4">
                      {job.companyLogo && (
                        <img 
                          src={job.companyLogo} 
                          alt={job.companyName} 
                          className="w-12 h-12 object-contain"
                        />
                      )}
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {job.jobTitle}
                        </h3>
                        <p className="text-gray-600 truncate">
                          {job.companyName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <LocationBadges locations={job.jobLocations} />
                      
                      <div className="flex flex-wrap gap-2">
                        {job.employmentType && (
                          Array.isArray(job.employmentType) ? (
                            job.employmentType.map((type, index) => (
                              <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                {type}
                              </span>
                            ))
                          ) : (
                            job.employmentType.split(',').map((type, index) => (
                              <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                {type}
                              </span>
                            ))
                          )
                        )}
                        {job.experience && job.experience.min !== undefined && job.experience.max !== undefined && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {job.experience.min} - {job.experience.max} years
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Posted: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    {job.salary && job.salary.min && job.salary.max && (
                      <p className="text-sm font-medium mt-1 text-gray-700">
                        ₹{job.salary.min}L - ₹{job.salary.max}L
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mt-4">{job.description?.slice(0, 150)}...</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FindJob;