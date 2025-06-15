import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/signin');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.circle}>
        <span style={styles.check}>✓</span>
      </div>
      <h2 style={styles.text}>Successful!</h2>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    backgroundColor: '#f2fff2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 50,
    color: '#fff',
  },
  text: {
    marginTop: 20,
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: 'bold',
  },
};

export default SuccessScreen;
