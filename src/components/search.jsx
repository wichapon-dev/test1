import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import { IoMdSearch } from "react-icons/io";

function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      fetch(`http://localhost:5000/tb-problems/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => setProblems(data.filter(problem => problem.status === 'approved')))
        .catch(error => console.error('Error fetching search results:', error));
    } else {
      axios.get('http://localhost:5000/tb-problems/common')
        .then(response => {
          setProblems(response.data.filter(problem => problem.status === 'approved'));
        })
        .catch(error => console.error('Error fetching common problems:', error));
    }
  };

  useEffect(() => {
    handleSearch();
  }, [query]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
      />
      <button className='btn-search' onClick={handleSearch}><IoMdSearch /></button>
    </div>
  );
}

export default Search;