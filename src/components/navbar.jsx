import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import './navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
      }
    });
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleCreateClick = () => {
    navigate('/addproblem');
  };

  const handleAllClick = () => {
    navigate('/all-problems');
  };

  // const handleCMPClick = () => {
  //   navigate('/commonproblems');
  // };

  const handlePendingProblemsClick = () => {
    if (user && user.role === 'admin') {
      navigate('/admin-pending-problems');
    } else {
      navigate('/pending-problems');
    }
  };

  const handleHiddenProblemsClick = () => {
    navigate('/hidden-problems');
  };

  const handleUserProblemsClick = () => {
    navigate('/my-problems');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 onClick={handleHomeClick}>Knowledge Management</h1>
      </div>
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <b>Welcome : {user ? user.user_name : 'User'}</b>
            <br />
            <div className="dropdown">
              <button className="dropdown-button" onClick={toggleDropdown}>
                Menu
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <button className="hidden-button" onClick={handleUserProblemsClick}>
                    My Problems
                  </button>
                  <button className="All-button" onClick={handleAllClick}>
                    All Problems
                  </button>
                  {/* <button className="Common-button" onClick={handleCMPClick}>
                    Common Problems
                  </button> */}
                  <button className="create-button" onClick={handleCreateClick}>
                    Add Problems
                  </button>
                  <button className="pending-button" onClick={handlePendingProblemsClick}>
                    {user && user.role === 'admin' ? 'Problem Solving' : 'Problems Waiting For A Response'}
                  </button>
                  {/* {user && user.role === 'admin' && (
                    <button className="hidden-button" onClick={handleHiddenProblemsClick}>
                      Hidden Problems
                    </button>
                  )} */}
                </div>
              )}
              <button className="login-button" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <button className="login-button" onClick={handleLoginClick}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
