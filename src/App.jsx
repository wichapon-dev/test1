import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Home from './pages/home';
import Login from './pages/login';
import AllProblems from './pages/allproblems';
import CommonProblems from './pages/commonproblems';
import SearchResults from './pages/SearchResults';
import ProblemDetail from './pages/problemDetail';
import AddProblem from './pages/addProblem';
import PendingProblems from './pages/PendingProblems';
import EditProblem from './pages/EditProblem';
import AdminPendingProblems from './pages/AdminPendingProblems';
import HiddenProblems from './pages/HiddenProblems';
import MyProblems from './pages/MyProblems';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/all-problems" element={<AllProblems />} />
          <Route path="/commonproblems" element={<CommonProblems />} />
          <Route path="/problem/:id" element={<ProblemDetail />} />
          <Route path="/addproblem" element={<AddProblem />} />
          <Route path="/pending-problems" element={<PendingProblems />} />
          <Route path="/edit-problem/:id" element={<EditProblem />} />
          <Route path="/admin-pending-problems" element={<AdminPendingProblems />} />
          <Route path="/hidden-problems" element={<HiddenProblems />} />
          <Route path="/my-problems" element={<MyProblems />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
