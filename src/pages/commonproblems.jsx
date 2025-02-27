import React, { useState, useEffect } from 'react';
import './acProblems.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Header from '../components/header';
import { BiLike, BiShow } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function CommonProblems() {
  const [problems, setProblems] = useState([]);
  const [likesCount, setLikesCount] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/tb-problems/common')
      .then(response => {
        setProblems(response.data.filter(problem => problem.status === 'approved'));
        response.data.forEach(problem => {
          fetchLikesCount(problem.problems_id);
          checkUserLiked(problem.problems_id);
        });
      })
      .catch(error => console.error('Error fetching common problems:', error));
  }, []);

  const fetchLikesCount = async (problemId) => {
    try {
      const response = await axios.get(`http://localhost:5000/tb-like/count/${problemId}`);
      setLikesCount(prev => ({ ...prev, [problemId]: response.data }));
    } catch (error) {
      console.error('Error fetching likes count:', error);
    }
  };

  const checkUserLiked = async (problemId) => {
    if (user && user.user_id) {
      try {
        const response = await axios.get(`http://localhost:5000/tb-like/user/${user.user_id}/problem/${problemId}`);
        setUserLiked(prev => ({ ...prev, [problemId]: response.data.liked }));
      } catch (error) {
        console.error('Error checking if user liked the problem:', error);
      }
    }
  };

  const handleLike = async (problemId) => {
    if (user && user.user_id) {
      try {
        const response = await axios.post(`http://localhost:5000/tb-like/like/${problemId}`, {
          userId: user.user_id,
        });
        setUserLiked(prev => ({ ...prev, [problemId]: response.data.liked }));
        fetchLikesCount(problemId);
      } catch (error) {
        console.error('Error liking the problem:', error);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'กรุณาเข้าสู่ระบบก่อนที่จะกดถูกใจ',
      });
    }
  };

  const handleProblemClick = async (id) => {
    try {
      await axios.post(`http://localhost:5000/tb-view/increment/${id}`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
    navigate(`/problem/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="b-g">
        <h1>Common Problems</h1>
        <Header />
        <div className="problems-list">
          {problems.length > 0 ? (
            problems.map(problem => (
              <div className="problem-card" key={problem.problems_id} onClick={() => handleProblemClick(problem.problems_id)}>
                <h3>{problem.topic}</h3>
                <div className="problem-meta">
                  <p>Posted by: {problem.employee ? problem.employee.user_name : 'Unknown'}</p>
                  <p>Date: {problem.date_last_post}</p>
                  <p>
                    <span onClick={(e) => { e.stopPropagation(); handleLike(problem.problems_id); }}
                      style={{ cursor: 'pointer', color: userLiked[problem.problems_id] ? 'blue' : 'black' }}>
                      <BiLike /> {likesCount[problem.problems_id] || 0} Likes
                    </span>
                  </p>
                  <p><BiShow /> {problem.views && problem.views.length > 0 ? problem.views[0].view_count : 0} Views</p>
                </div>
              </div>
            ))
          ) : (
            <p>No common problems found.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default CommonProblems;
