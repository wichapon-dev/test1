import React, { useState, useEffect } from 'react';
import './acProblems.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Header from '../components/header';

const PendingProblems = () => {
  const [problems, setProblems] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 5;

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:5000/tb-problems/user/${user.user_id}/pending`)
        .then(response => {
          const sortedProblems = response.data.sort((a, b) => new Date(b.date_last_post) - new Date(a.date_last_post));
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
  const currentProblems = problems.slice(indexOfFirstProblem, indexOfLastProblem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(problems.length / problemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Navbar />
      <div className="b-g">
        <div className="allproblems-container">
          <h1>Problems Waiting For A Response</h1>
          <Header />
          <div className="problems-list">
            {currentProblems.length > 0 ? (
              currentProblems.map(problem => (
                <div
                  className="problem-card" key={problem.problems_id}
                  onClick={() => handleProblemClick(problem.problems_id)}>
                  <div className='td'>
                    <h3>{problem.topic}</h3>
                    <h5 className='homedeteil'>{problem.detail}</h5>
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

export default PendingProblems;
