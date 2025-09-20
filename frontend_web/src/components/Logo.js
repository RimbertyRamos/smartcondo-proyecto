import React from 'react';

const Logo = ({ size = 60, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }}
  >
    <path
      d="M8 21V11M8 11H16M8 11L4 7M16 21V11M16 11L20 7M12 3L4 7H20L12 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 21V15M12 15H10M12 15H14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;