
function Button(props){
    const variant = props.variant || 'Default';
    
    const getVariantClasses = () => {
        switch(variant) {
            case 'Default':
                return 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white';
            case 'Exit':
                return 'bg-red-500 hover:bg-red-600 text-white';
            case 'Confirm':
                return 'bg-green-500 hover:bg-green-600 text-white';
            case 'Cancel':
                return 'bg-gray-500 hover:bg-gray-600 text-white';
            default:
                return 'bg-blue-500 hover:bg-blue-600 text-white';
        }
    };

    const borderRadius = props.rounded ? 'rounded-full' : 'rounded-lg';

    return (
        <button 
            className={`px-6 py-3 font-semibold transition-all duration-200 border-none cursor-pointer ${getVariantClasses()} ${borderRadius}`}
            onClick={props.onClick}
        >
            {props.label}
        </button>
    )
}

export default Button;