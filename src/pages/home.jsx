import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiLike, BiShow } from 'react-icons/bi';
import Navbar from '../components/navbar';
import './home.css';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function Home() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [query, setQuery] = useState('');
  const [likesCount, setLikesCount] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:5000/tb-problems/common')
      .then(response => {
        setProblems(response.data.filter(problem => problem.status === 'global' && !problem.isHidden));
        response.data.forEach(problem => {
          fetchLikesCount(problem.problems_id);
          checkUserLiked(problem.problems_id);
        });
      })
      .catch(error => console.error('Error fetching common problems:', error));
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await axios.get('/tb-problems');
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

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
        const response = await axios.get(`http://localhost:5000/tb-like/user/${user.user_id}/problem/${problemId}`); // Check if user liked the problem
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
        text: 'You need to log in before liking a problem.',
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

  const handleCreateClick = () => {
    if (user) {
      navigate('/addproblem');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Please log in',
        text: 'You need to log in before adding a new problem.',
      }).then(() => {
        navigate('/login');
      });
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      fetch(`http://localhost:5000/tb-problems/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => setProblems(data.filter(problem => problem.status === 'global' && !problem.isHidden)))
        .catch(error => console.error('Error fetching search results:', error));
    } else {
      axios.get('http://localhost:5000/tb-problems/common')
        .then(response => {
          setProblems(response.data.filter(problem => problem.status === 'global' && !problem.isHidden));
        })
        .catch(error => console.error('Error fetching common problems:', error));
    }
  };

  useEffect(() => {
    handleSearch();
  }, [query]);

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
        title: 'The problem has been hidden',
        text: 'You have successfully hidden this problem.',
      });
    } catch (error) {
      console.error('Error hiding the problem:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'An error occurred',
        text: error.response ? error.response.data.message : 'Unable to hide the problem. Please try again.',
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className='bg'>
        <div>
          <h1>HELLO !!</h1>
          <h3>How can we help you?</h3>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={handleInputChange} 
          />
        </div>
        <div className="problems-list">
          <h2>{query.trim() ? 'Discovered problems' : 'Common problems'}</h2>
          {problems.length > 0 ? (
            problems.map(problem => (
              <div
                className="problem-card" key={problem.problems_id}
                onClick={() => handleProblemClick(problem.problems_id)}>
                <div className='td'>
                  <h3>{problem.topic}</h3>
                  <h5 className='homedeteil'>{problem.detail}</h5>
                  {/* {user && user.role === 'admin' && ( // Show hide button for admin
                            <button onClick={(e) => { e.stopPropagation(); handleHideProblem(problem.problems_id); }} className="hide-button">
                              Hide Problem
                            </button>
                          )} */}
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
            <div>
              <h3>No common problems found.</h3>
              <p>(If no problems are found, click the button to add a problem)</p>
              <button
                className='homecreate-button'
                onClick={handleCreateClick}>Add Problems
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
