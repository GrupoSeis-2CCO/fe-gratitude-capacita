import '../styles/Button.css'

function Button(props){
    
    const buttonStyle = {
        '--button-border-radius': props.rounded ? '10rem' : '1.5rem'
    }

    return (
        <button 
            className={`Button ${props.variant}`} 
            style={buttonStyle} 
            onClick={props.onClick}
        >
            {props.label}
        </button>
    )
}

export default Button;