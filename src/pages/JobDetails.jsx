import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const API_BASE_URL =`${import.meta.env.VITE_BACKEND_URI}/api`;
  
  const formRef = useRef(null);

  const handleApplyClick = () => {
    setShowForm(!showForm);

    if (!showForm) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const [formData, setFormData] = useState({
    email: '',
    linkedinUrl: '',
    resume: null
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false
  });
  
  const navigate = useNavigate();

  const formatUrl = (url) => {
    if (!url) return '';
    
    // Remove any trailing slashes
    url = url.trim().replace(/\/+$/, '');
    
    // Check if the URL already has a protocol
    if (url.match(/^https?:\/\//)) {
      return url;
    }
    
    // Check if URL starts with www.
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }
    
    // Add https:// if no protocol or www.
    return `https://${url}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'linkedinUrl') {
      // Store the raw value in form state
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      resume: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.linkedinUrl || !formData.resume) {
      setSubmitStatus({
        loading: false,
        error: 'Please fill in all required fields',
        success: false
      });
      return;
    }
    
    setSubmitStatus({ loading: true, error: null, success: false });
  
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('jobId', id);
      formDataToSubmit.append('email', formData.email);
      // Format the LinkedIn URL before submission
      formDataToSubmit.append('linkedinUrl', formatUrl(formData.linkedinUrl));
      formDataToSubmit.append('resume', formData.resume);
  
      const response = await axios.post(
        `${API_BASE_URL}/applications`,
        formDataToSubmit,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      if (response.data.success) {
        setSubmitStatus({
          loading: false,
          error: null,
          success: true
        });
        setFormData({
          email: '',
          linkedinUrl: '',
          resume: null
        });
        setShowForm(false);
  
        // Alert on successful application
        window.alert("Successfully applied for the job!");
      }
    } catch (err) {
      setSubmitStatus({
        loading: false,
        error: err.message || 'Failed to submit application',
        success: false
      });
    }
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
        
        if (response.data.success) {
          setJob(response.data.data);
          setError(null);
        } else {
          setError('Failed to fetch job details');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-yellow-600">Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-8 pt-2">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
        <div className="bg-indigo-600 p-6">
          <div className="flex items-center gap-4">
            {job.companyLogo && (
              <img 
                src={job.companyLogo} 
                alt={job.companyName} 
                className="w-16 h-16 object-contain bg-white rounded-lg p-2"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{job.jobTitle}</h1>
              <p className="text-indigo-200 mt-2">{job.companyName}</p>
              <p className="text-indigo-200 mt-2">{job.jobLocation}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {job.employmentType.map((type, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full"
              >
                {type}
              </span>
            ))}
          </div>
          
          <div className="flex gap-2 mb-6">
            {Array.isArray(job.workMode) && job.workMode.map((mode, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-full"
              >
                {mode}
              </span>
            ))}
          </div>

          <div className="flex gap-4 mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              {job.salary.min}LPA - {job.salary.max}LPA
            </span>

            {job.experience && job.experience.min !== undefined && job.experience.max !== undefined && (
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full">
                {job.experience.min} - {job.experience.max} years
              </span>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Roles and Responsibilities</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.rolesAndResponsibilities}</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
          
          <a 
            href={job.companyUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 underline mr-4"
          >
            Visit Company Website
          </a>

          <button 
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all"
            onClick={handleApplyClick}
          >
            {showForm ? "Hide Application Form" : "Apply Now"}
          </button>
        </div>
      </div>

      {showForm && (
        <div 
          ref={formRef}
          className="mt-8 max-w-4xl mx-auto bg-gray-100 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">Apply for this Job</h2>
          
          {submitStatus.success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              Application submitted successfully!
            </div>
          )}

          {submitStatus.error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              Error: {submitStatus.error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                LinkedIn Profile *
              </label>
              <input
                type="text"
                id="linkedinUrl"
                name="linkedinUrl"
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                required
                placeholder="www.linkedin.com/in/your-profile or linkedin.com/in/your-profile"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                Upload Resume *
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf,.docx,.doc"
                className="mt-2 block w-full text-sm text-gray-700 border border-gray-300 rounded-lg"
                onChange={handleFileChange}
                required
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all"
              disabled={submitStatus.loading}
            >
              {submitStatus.loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default JobDetail;