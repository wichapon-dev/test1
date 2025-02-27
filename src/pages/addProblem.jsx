import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';
import { useAuth } from '../context/AuthContext';
import './addProblem.css';
import Swal from 'sweetalert2';
import { FaFilePdf, FaFileImage, FaFileAlt } from 'react-icons/fa';

const AddProblem = () => {
  const [topic, setTopic] = useState('');
  const [detail, setDetail] = useState('');
  const [solution, setSolution] = useState('');
  const [viewsId] = useState(1);
  const [files, setFiles] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [uploadProgress, setUploadProgress] = useState(0);

  const getFileIcon = (file) => {
    const fileType = file.type;
    if (fileType.includes('pdf')) return <FaFilePdf />;
    if (fileType.includes('image/jpeg') || fileType.includes('image/png')) return <FaFileImage />;
    return <FaFileAlt />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problemData = {
      topic,
      detail,
      solution: solution || '',
      employeeId: user.user_id,
      viewsId,
      status: user && user.role === 'admin' ? 'global' : 'pending',
    };

    try {
      const response = await axios.post('http://localhost:5000/tb-problems', problemData);
      const problemId = response.data.problems_id;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });

        Swal.fire({
          title: 'Uploading files...',
          html: '<progress value="0" max="100" id="progress-bar" style="width: 100%;"></progress>',
          showConfirmButton: false,
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });

        await axios.post(`http://localhost:5000/tb-files/${problemId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentage);
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
              progressBar.value = percentage;
            }
          }
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Problem Added Successfully',
        text: 'Your problem has been added successfully',
      });

      navigate(user && user.role === 'admin' ? '/' : '/pending-problems');
    } catch (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fill in all fields',
        text: 'You have not added a problem in the required fields',
      });
      console.error('Error adding problem:', error);
    }
  };

  const handleCancelClick = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'If you cancel, all data will be lost!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No, continue'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/');
      }
    });
  };

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <>
      <Navbar />
      <div className="add-problem-container">
        <form onSubmit={handleSubmit}>
          <div className='CT'>
            <h4 className='text'>Problem Topic:</h4>
            <input
              className='topic'
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <h4 className='text'>Details:</h4>
            <textarea
              className='detail'
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
          {user && user.role === 'admin' && (
            <div>
              <h4 className='text'>Solution:</h4>
              <textarea
                className='solution'
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </div>
          )}
          <div className="file-upload-container">
            <h4 className='file-upload-label'>Upload Files:</h4>
            <label className="file-upload-button" htmlFor="file-upload">Choose Files</label>
            <input
              id="file-upload"
              className="file-upload-input"
              type="file"
              multiple
              onChange={handleFileChange}
            />
          </div>
          <div className="file-list">
            {files.length > 0 && (
              <ul>
                {files.map((file, index) => (
                  <li key={index} className="file-item">
                    {getFileIcon(file)}
                    <span>{file.name}</span>
                    <button type="button" className='delete-button' onClick=
                      {() => handleRemoveFile(index)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className='btn-submit' type="submit">Submit</button>
          <button className='btn-cancel' type="button" onClick={handleCancelClick}>Cancel</button>
        </form>
      </div>
    </>
  );
};

export default AddProblem;
