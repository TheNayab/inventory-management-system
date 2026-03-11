import React from 'react';
import { FaClock } from 'react-icons/fa';

const Navbar = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-title">
        Inventory Management
      </div>
      <div className="navbar-info">
        <FaClock />
        <span>{currentTime.toLocaleTimeString()}</span>
        <span>{currentTime.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default Navbar;
