import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Header from '../components/header';
import './acProblems.css';
import { BiLike, BiShow } from 'react-icons/bi';

function SearchResults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      fetch(`http://localhost:5000/tb-problems/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => setResults(data.filter(problem => problem.status === 'approved')))
        .catch(error => console.error('Error fetching search results:', error));
    }
  }, [query]);

  const handleProblemClick = (id) => {
    navigate(`/problem/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className='search-results'>
        <h1>ผลการค้นหาสำหรับ "{query}"</h1>
        <Header />
        {results.length ? (
          results.map(problem => (
            <div
              key={problem.problems_id}
              className="problem-card"
              onClick={() => handleProblemClick(problem.problems_id)}>
              <h3>{problem.topic}</h3>
              <div className="problem-meta">
                <p>โพสต์โดย: {problem.employee ? problem.employee.user_name : 'Unknown'}</p>
                <p>วันที่: {problem.date_last_post}</p>
                <p><BiLike /> {problem.likes ? problem.likes.like_count : 0}</p>
                <p><BiShow /> {problem.views ? problem.views.view_count : 0} เข้าชม</p>
              </div>
            </div>
          ))
        ) : (
          <p>ไม่พบผลการค้นหา</p>
        )}
      </div>
    </>
  );
}

export default SearchResults;