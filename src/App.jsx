import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../src/components/login/Login';
import { Signup } from './components/signup/Signup';
import Dashboard from './components/dashboard/Dashboard';
import { Home } from './components/home/Home';
import SuccessScreen from './components/sucessful/Success';
import ForgotPAssword from './components/Recovery/ForgotPAssword';
import ChangePassword from './components/ChnagePassword/ChangePassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route path="/forgot" element={<ForgotPAssword/>}/>
        <Route path='/change' element={<ChangePassword/>}/>
      </Routes>
    </Router>
  );
}

export default App;
