// RegisterGoogle.js

import { useContext, useEffect, useState } from 'react';
import { useAuth} from '../context/AuthContext'; // adjust path as needed
import api from '../services/api';

const RegisterGoogle = () => {
  const { user } = useAuth(); // get user from context
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user || !user._id) {
        setError('No user ID found');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/user/${user._id}`);
        setUserData(res.data);
      } catch (err) {
        setError('Error fetching user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Complete your profile</h2>
      <p>Name: {userData.firstName}</p>
      <p>Email: {userData.email}</p>
      {/* Show rest of the form to complete registration */}
    </div>
  );
};

export default RegisterGoogle;
