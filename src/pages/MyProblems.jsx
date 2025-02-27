import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';
import { useAuth } from '../context/AuthContext';
import Header from '../components/header';
import { useNavigate } from 'react-router-dom';
import './acProblems.css';

const MyProblems = () => {
  const [problems, setProblems] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProblems = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/tb-problems/user/${user.user_id}`);

        setProblems(response.data);
      } catch (error) {
        console.error('Error fetching user problems:', error);
      }
    };

    if (user && user.user_id) {
      fetchUserProblems();
    }
  }, [user]);

  const handleProblemClick = (id) => {
    navigate(`/problem/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="b-g">
        <div className="allproblems-container">
          <h1>Your Problems</h1>
          <Header />
          <div className="problems-list">
            {problems.length > 0 ? (
              problems.map(problem => (
                <div
                  className="problem-card" key={problem.problems_id}
                  onClick={() => handleProblemClick(problem.problems_id)}>
                  <div className='td'>
                    <h3>{problem.topic}</h3>
                    <h5 className='homedetail'>{problem.detail}</h5>
                  </div>
                  <div className="problem-meta">
                    <p>Posted by: {problem.employee ? problem.employee.user_name : 'Unknown'}</p>
                    <p>Date: {problem.date_last_post}</p>
                    <p>Status: {problem.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No problems added by you.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProblems;
