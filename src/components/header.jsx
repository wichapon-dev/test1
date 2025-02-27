import React from 'react';
import './header.css';

const Header = () => {
  return (
    <div className="table-header">
      <span className='toppic-left'>Topic</span>
      <span>Create by</span>
      <span>Last Post</span>
      <span>Like</span>
    </div>
  );
};

export default Header;