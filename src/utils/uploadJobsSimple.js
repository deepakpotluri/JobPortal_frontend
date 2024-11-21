// job-board-client/src/utils/uploadJobsSimple.js
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function uploadJobs() {
  try {
    // Read the jobs.json file
    const jobsData = await readFile(
      join(__dirname, '../../public/jobs.json'),
      'utf8'
    );
    const jobs = JSON.parse(jobsData);

    console.log('Uploading jobs to server...');
    
    // Upload to server using fetch
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/save-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobs),
    });

    const result = await response.json();
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// Execute the upload
uploadJobs();