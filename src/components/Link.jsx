import '../styles/Link.css'

function Link(props){

    return (
        <a className= 'Link' href={`${props.redirectUrl}`}>
            {props.text}
        </a>
    )
}

export default Link;