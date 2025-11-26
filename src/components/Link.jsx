import { Link as RouterLink } from 'react-router-dom';

function Link({ text, redirect, className = "", onClick }) {
  return (
    <RouterLink
      className={`text-white hover:text-orange-400 font-medium transition-colors duration-200 text-lg ${className}`}
      to={`${redirect}`}
      onClick={onClick}
    >
      {text}
    </RouterLink>
  );
}

export default Link;
