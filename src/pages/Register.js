// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import './Auth.css';
// import React, { useState } from 'react';
// import { Navigate } from 'react-router-dom';
// return(
// {
//     Navigate
// }
// )

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);
  return null;
};

export default Register;