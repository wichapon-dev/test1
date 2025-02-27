import React, { useState, useEffect } from 'react';
import './acProblems.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { BiLike, BiShow } from 'react-icons/bi';
import Header from '../components/header';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function AllProblems() {
  const [problems, setProblems] = useState([]);
  const [likesCount, setLikesCount] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 10;

  useEffect(() => {
    axios.get('http://localhost:5000/tb-problems/all')
      .then(response => {
        setProblems(response.data.filter(problem => problem.status === 'global'));
        response.data.forEach(problem => {
          fetchLikesCount(problem.problems_id);
          checkUserLiked(problem.problems_id);
        });
      })
      .catch(error => console.error('Error fetching problems:', error));
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
        title: 'Please log in',
        text: 'Please log in before liking a problem',
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

  const handleHideProblem = async (problemId) => {
    try {
      await axios.put(`http://localhost:5000/tb-problems/hide/${problemId}`, {
        isHidden: true,
      });
      setProblems(prevProblems =>
        prevProblems.filter(problem => problem.problems_id !== problemId)
      );
      Swal.fire({
        icon: 'success',
        title: 'Problem hidden',
        text: 'You have successfully hidden this problem',
      });
    } catch (error) {
      console.error('Error hiding the problem:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response ? error.response.data.message : 'Unable to hide the problem. Please try again.',
      });
    }
  };

  // Calculate problems to display
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = problems.slice(indexOfFirstProblem, indexOfLastProblem);

  // Create page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(problems.length / problemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Navbar />
      <div className='b-g'>
        <div className="allproblems-container">
          <h1>All Problems</h1>
          <Header />
          <div className="problems-list">
            {currentProblems.length > 0 ? (
              currentProblems.map(problem => (
                <div className="problem-card" key={problem.problems_id} onClick={() => handleProblemClick(problem.problems_id)}>
                  <div className='td'>
                    <h3>{problem.topic}</h3>
                    <h5 className='homedetail'>{problem.detail}</h5>
                    {/* {user && user.role === 'admin' && (
                      <button onClick={(e) => { e.stopPropagation(); handleHideProblem(problem.problems_id); }} className="hide-button">
                        Hide Problem
                      </button>
                    )} */}
                  </div>

                  <div className="homeproblem-meta">
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
              <p>No problems found.</p>
            )}
          </div>
          <div className="pagination">
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={number === currentPage ? 'active' : ''}>
                {number}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AllProblems;
