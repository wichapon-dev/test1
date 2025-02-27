import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';
import { BiLike, BiShow, BiFile, BiImage } from 'react-icons/bi';
import { AiFillFilePdf } from 'react-icons/ai';
import './problemDetail.css';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const { user } = useAuth();


  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/tb-comments/problem/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };


  const fetchLikesCount = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/tb-like/count/${id}`);
      setLikesCount(response.data);
    } catch (error) {
      console.error('Error fetching likes count:', error);
    }
  };

  const checkUserLiked = async () => {
    if (user && user.user_id) {
      try {
        const response = await axios.get(`http://localhost:5000/tb-like/user/${user.user_id}/problem/${id}`);
        setUserLiked(response.data.liked);
      } catch (error) {
        console.error('Error checking if user liked the problem:', error);
      }
    }
  };

  const handleLike = async () => {
    if (user && user.user_id) {
      try {
        const response = await axios.post(`http://localhost:5000/tb-like/like/${id}`, {
          userId: user.user_id,
        });
        setUserLiked(response.data.liked);
        fetchLikesCount();
      } catch (error) {
        console.error('Error liking the problem:', error);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Please log in',
        text: 'Please log in before liking',
      });
    }
  };

  const handleStatusChange = async (status) => {
    if (problem.status === "pending") {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot change status',
        text: 'This problem is currently pending and cannot be updated.',
      });
      return;
    }

    if (user && user.user_id === problem.employee.user_id) {
      try {
        await axios.patch(`http://localhost:5000/tb-problems/${id}/status`, { status });
        setProblem({ ...problem, status });
      } catch (error) {
        console.error('Error updating problem status:', error);
      }
    }
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/tb-problems/${id}`);
        setProblem(response.data);
      } catch (error) {
        console.error('Error fetching the problem details:', error);
      }
    };

    const fetchFiles = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/tb-files/problem/${id}`);
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchProblem();
    fetchFiles();
    fetchComments();
    fetchLikesCount();
    checkUserLiked();
  }, [id, user]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Please add a comment',
        text: 'You have not entered a comment',
      });
      return;
    }

    if (user && user.user_id) {
      try {
        await axios.post(`http://localhost:5000/tb-comments`, {
          comments_detail: newComment,
          userId: user.user_id,
          problemId: parseInt(id, 10),
        });
        setNewComment('');
        fetchComments();
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Please log in',
        text: 'Please log in before adding a comment',
      });
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

  if (!problem) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="problem-detail-container">
        <div className="problem-detail">
          <h1>{problem.topic}</h1>
          <p>{problem.detail}</p>
          <div>
            <h2>Solution</h2>
            <p>{problem.solution}</p>
          </div>
          <div className="problem-files">
            <h4>Files:</h4>
            {files.length > 0 ? (
              files.map(file => (
                <a
                  key={file.file_id}
                  href={`http://localhost:5000${file.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-link"
                >
                  {getFileIcon(file.file_path)} {file.file_path.split('/').pop()}
                </a>
              ))
            ) : (
              <p>No files uploaded for this problem.</p>
            )}
          </div>
          <div className="problem-meta">
            <p className='PD'>
              Posted by: {problem.employee ? problem.employee.user_name : 'Unknown'}<br />
              Date: {problem.date_last_post}
            </p>
          </div>
          <div className="problem-stats">
            <span
              onClick={handleLike}
              style={{ cursor: 'pointer', color: userLiked ? 'blue' : 'black' }}>
              <BiLike />
              {likesCount}
              Likes
            </span>
            <span>
              <BiShow /> {problem.views && problem.views.length > 0 ? problem.views[0].view_count : 0}
              Views
            </span>
          </div><br />
          {/* {user && user.user_id === problem.employee.user_id && problem.status !== 'pending' && (
            <div className="status-container">
              <label>
                Status :
                <select value={problem.status} onChange={(e) => handleStatusChange(e.target.value)}>
                  <option value="global">Global</option>
                  <option value="private">Private</option>
                </select>
              </label>
            </div>
          )} */}
          <div className="problem-comments">
            <h3>Comments</h3>
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.comments_id} className="comment">
                  <p><b>By: {comment.user ? comment.user.user_name : 'Unknown'}</b></p>
                  <p>{comment.comments_detail}</p>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
            <form onSubmit={handleAddComment}>
              <textarea className='addcomment'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
              />
              <button className='addcommentsubmit' type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProblemDetail;
