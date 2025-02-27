import React, { useState, useEffect } from 'react';
import './acProblems.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Header from '../components/header';

const AdminPendingProblems = () => {
  const [problems, setProblems] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const problemsPerPage = 5;

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:5000/tb-problems/all`)
        .then(response => {
          const sortedProblems = response.data
            .filter(problem => problem.status === 'pending' || problem.status === 'hide' || problem.status === 'global')
            .sort((a, b) => {
              if (a.status === 'pending' && b.status !== 'pending') return -1;
              if (b.status === 'pending' && a.status !== 'pending') return 1;
              return new Date(b.date_last_post) - new Date(a.date_last_post);
            });
          setProblems(sortedProblems);
        })
        .catch(error => console.error('Error fetching pending problems:', error));
    }
  }, [user]);

  const handleProblemClick = async (id) => {
    try {
      await axios.post(`http://localhost:5000/tb-view/increment/${id}`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
    navigate(`/edit-problem/${id}`);
  };

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;

  const filteredProblems = problems.filter(problem =>
    problem.topic.toLowerCase().includes(query.toLowerCase())
  );

  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProblems.length / problemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Navbar />
      <div className="b-g">
        <div className="allproblems-container">
          <h1>Pending Problems</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search problems..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <br />
          <Header />
          <div className="problems-list">
            {currentProblems.length > 0 ? (
              currentProblems.map(problem => (
                <div className="problem-card" key={problem.problems_id}
                  onClick={() => handleProblemClick(problem.problems_id)}>
                  <div className='td'>
                    <h3>{problem.topic}</h3>
                    <h5 className='homedetail'>{problem.detail}</h5>
                  </div>
                  <div className="homeproblem-meta">
                    <p>Posted by: {problem.employee ? problem.employee.user_name : 'Unknown'}</p>
                    <p>Date: {problem.date_last_post}</p>
                    <p>Status: {problem.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending problems found</p>
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
};

export default AdminPendingProblems;
