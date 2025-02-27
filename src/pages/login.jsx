import React, { useState } from 'react';
import './login.css';
import { IoChevronBackCircle } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        user_email: email,
        user_password: password,
      });

      const { access_token, user_id, user_name, role } = response.data;
      login(access_token, { user_id, user_email: email, user_name, role });
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You have logged in successfully.',
      });
      navigate('/');
    } catch (error) {
      setError('Invalid credentials');
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'The email or password is incorrect. Please try again.',
      });
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className='btn-back' onClick={handleBackClick}>
          <IoChevronBackCircle />
        </div>
        <div className='s'>
          <h1>Knowledge Management</h1>
          <h2>Login</h2>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="login-button">Login</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
