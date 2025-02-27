import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { BiFile, BiImage } from 'react-icons/bi';
import { AiFillFilePdf } from 'react-icons/ai';
import './editProblem.css';

const EditProblem = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [topic, setTopic] = useState('');
  const [detail, setDetail] = useState('');
  const [solution, setSolution] = useState('');
  const [status, setStatus] = useState('');
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();


  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:5000/tb-problems/${id}`)
      .then(response => {
        const data = response.data;
        setProblem(data);
        setTopic(data.topic);
        setSolution(data.solution || '');
        setDetail(data.detail);
        setStatus(data.status);
      })
      .catch(error => {
        console.error('Error fetching problem:', error);
        Swal.fire('Error', 'Unable to fetch problem data', 'error');
      });

    axios.get(`http://localhost:5000/tb-files/problem/${id}`)
      .then(response => {
        setExistingFiles(response.data);
      })
      .catch(error => {
        console.error('Error fetching files:', error);
        Swal.fire('Error', 'Unable to fetch files', 'error');
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateProblemData = { topic, detail, solution, status };

    try {
      const response = await axios.put(`http://localhost:5000/tb-problems/${id}`, updateProblemData);
      console.log('Problem updated:', response.data);

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

        await axios.post(`http://localhost:5000/tb-files/${id}/upload`, formData, {
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

      Swal.fire('Success', 'Problem updated successfully', 'success');
      if (user && user.role === 'admin') {
        navigate('/admin-pending-problems');
      } else {
        navigate('/pending-problems');
      }
    } catch (error) {
      console.error('Error updating problem:', error);
      Swal.fire('Error', 'Unable to update problem', 'error');
    }
  };

  const handleCancelClick = () => {
    Swal.fire({
      title: 'Confirm cancellation?',
      text: "All changes will not be saved",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No, continue'
    }).then((result) => {
      if (result.isConfirmed) {
        if (user && user.role === 'admin') {
          navigate('/admin-pending-problems');
        } else {
          navigate('/pending-problems');
        }
      }
    });
  };

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleRemoveNewFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/tb-files/${fileId}`);
      setExistingFiles(existingFiles.filter(file => file.file_id !== fileId));
      Swal.fire('Deleted!', 'File deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting file:', error);
      Swal.fire('Error', 'Unable to delete file', 'error');
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <AiFillFilePdf />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <BiImage />;
      case 'doc':
      case 'docx':
        return <BiFile />;
      default:
        return <BiFile />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="edit-problem-container">
        <h1>Edit Problem</h1>
        {problem ? (
          <form onSubmit={handleSubmit}>
            <div className='CT'>
              <h4 className='text'>Problem Name:</h4>
              <input
                className='topic'
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                readOnly={user && user.role === 'admin'}
              />
            </div>
            <div>
              <h4 className='text'>Details:</h4>
              <textarea
                className='detail'
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                readOnly={user && user.role === 'admin'}
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
            <div className="new-files">
              <h4 className='text'>New Files Added:</h4>
              <ul className='file'>
                {files.map((file, index) => (
                  <li key={index}>
                    {getFileIcon(file.name)} {file.name}
                    <button className="delete-button" type="button" onClick={() => handleRemoveNewFile(index)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="existing-files">
              <h4 className='text'>Existing Files:</h4>
              <ul className='file'>
                {existingFiles.map(file => (
                  <li key={file.file_id}>
                    {getFileIcon(file.file_path)} {file.file_path}
                    <button
                      className="delete-button" type="button"
                      onClick={() => handleDeleteFile(file.file_id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {user && user.role === 'admin' && (
              <div>
                <h4 className='text'>Status:</h4>
                <div className='radio'>
                  <div>
                    <label className='radio-btn'>
                      <input
                        type="radio"
                        value="pending"
                        checked={status === 'pending'}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      Pending
                    </label>
                  </div>
                  <div>
                    <label className='radio-btn'>
                      <input
                        type="radio"
                        value="global"
                        checked={status === 'global'}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      Approved
                    </label>
                  </div>
                  <div>
                    <label className='radio-btn'>
                      <input
                        type="radio"
                        value="hide"
                        checked={status === 'hide'}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      Hide
                    </label>
                  </div>
                  <br />
                </div>
              </div>
            )}
            <button type="submit" className="btn-submit">Save</button>
            <button type="button" className="btn-cancel" onClick={handleCancelClick}>Cancel</button>
          </form>
        ) : (
          <p>Loading problem data...</p>
        )}
      </div>
    </>
  );
};

export default EditProblem;
