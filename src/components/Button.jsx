import '../styles/Button.css'

function Button(props){
    const variant = props.variant || 'Default';
    
    const borderRadius = {
        '--button-border-radius': props.rounded ? '10rem' : '1.5rem'
    }

    return (
        <button 
            className={`Button ${variant}`} 
            style={borderRadius} 
            onClick={props.onClick}
        >
            {props.label}
        </button>
    )
}

export default Button;