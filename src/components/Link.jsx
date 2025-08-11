import '../styles/Link.css'
import { Link as RouterLink } from 'react-router-dom';

function Link(props){

    return (
        <RouterLink className='Link' to={`${props.redirect}`}>
            {props.text}
        </RouterLink>
    )
}

export default Link;