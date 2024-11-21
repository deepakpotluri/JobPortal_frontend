import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, X } from 'lucide-react';


const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const API_BASE_URL =`${import.meta.env.VITE_BACKEND_URI}/api`;

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/applications/job/${jobId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setApplications(response.data.applications);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (resumePath, email) => {
    try {
      const token = localStorage.getItem('token');
      const filename = resumePath.split('\\').pop();
      const response = await axios.get(
        `${API_BASE_URL}/applications/resume/download/${filename}`, // Ensure this matches the backend route
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/octet-stream' // This can help with download
          },
          responseType: 'blob'
        }
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${email}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download resume');
    }
  };
  const handleViewResume = (resumePath) => {
    const filename = resumePath.split('\\').pop();
    // Use the new view endpoint instead of the download endpoint
    const resumeUrl = `${API_BASE_URL}/applications/resume/view/${filename}`;
    setSelectedResume(resumeUrl);
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/applications/${applicationId}/status`, // Corrected route
        { status },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setApplications(apps => 
        apps.map(app => 
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update status');
    }
  };
  
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      interviewing: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold mb-2">Job Applications</h2>
        <p className="text-gray-600">No one has applied for this job yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Job Applications</h2>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{application.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {application.linkedinUrl ? (
                    <a 
                      href={application.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Profile
                    </a>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {application.resumePath && (
                      <>
                        <button
                          onClick={() => handleViewResume(application.resumePath)}
                          className="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadResume(application.resumePath, application.email)}
                          className="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                    className="block w-full rounded-md border-gray-300 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(application.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col relative">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Resume Preview</h3>
              <button
                onClick={() => setSelectedResume(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={selectedResume}
                className="w-full h-full rounded border"
                title="Resume Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;