import React, { useState, useEffect } from 'react';
import './acProblems.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { BiLike, BiShow } from 'react-icons/bi';
import Header from '../components/header';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function HiddenProblems() {
  const [problems, setProblems] = useState([]);
  const [likesCount, setLikesCount] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tb-problems/hideder');
        setProblems(response.data);

        const likesPromises = response.data.map(problem => fetchLikesCount(problem.problems_id));
        const userLikedPromises = response.data.map(problem => checkUserLiked(problem.problems_id));

        await Promise.all([...likesPromises, ...userLikedPromises]);
      } catch (error) {
        console.error('Error fetching hidden problems:', error);
      }
    };

    fetchAllData();
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
    if (!user || !user.user_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Please log in',
        text: 'You need to log in before liking.',
      });
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/tb-like/like/${problemId}`, {
        userId: user.user_id,
      });
      setUserLiked(prev => ({ ...prev, [problemId]: response.data.liked }));
      fetchLikesCount(problemId);
    } catch (error) {
      console.error('Error liking the problem:', error);
    }
  };

  const handleProblemClick = async (id) => {
    try {
      await axios.post(`http://localhost:5000/tb-view/increment/${id}`);
      navigate(`/problem/${id}`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleUnHideProblem = async (problemId) => {
    try {
      await axios.put(`http://localhost:5000/tb-problems/unhide/${problemId}`, {
        status: 'visible',
      });
      setProblems(problems.filter(problem => problem.problems_id !== problemId));
      Swal.fire('Success', 'The problem has been unhidden', 'success');
    } catch (error) {
      console.error('Error un-hiding problem:', error);
      Swal.fire('Error', 'Unable to unhide the problem', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <div className='b-g'>
        <div className="allproblems-container">
          <h1>Hidden Problems</h1>
          <Header />
          <div className="problems-list">
            {problems.length > 0 ? (
              problems.map(problem => (
                <div className="problem-card"
                  key={problem.problems_id}
                  onClick={() => handleProblemClick(problem.problems_id)}>
                  <div className='td'>
                    <h3>{problem.topic}</h3>
                    <h5 className='homedeteil'>{problem.detail}</h5>
                    {user && user.role === 'admin' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnHideProblem(problem.problems_id); }}
                        className="hide-button">
                        Unhide Problem
                      </button>
                    )}
                  </div>
                  <div className="homeproblem-meta">
                    <p>Posted by: {problem.employee ? problem.employee.user_name : 'Unknown'}</p>
                    <p>Date: {problem.date_last_post}</p>
                    <p>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleLike(problem.problems_id); }}
                        style={{ cursor: 'pointer', color: userLiked[problem.problems_id] ? 'blue' : 'black' }}>
                        <BiLike />
                        {likesCount[problem.problems_id] || 0}
                        Likes
                      </span>
                    </p>
                    <p><BiShow />
                      {problem.views && problem.views.length > 0 ? problem.views[0].view_count : 0}
                      Views
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No hidden problems found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HiddenProblems;
