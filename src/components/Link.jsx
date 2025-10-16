import { Link as RouterLink } from 'react-router-dom';

function Link(props){

    return (
        <RouterLink 
            className='text-white hover:text-orange-400 font-medium transition-colors duration-200 text-lg' 
            to={`${props.redirect}`}
        >
            {props.text}
        </RouterLink>
    )
}

export default Link;
