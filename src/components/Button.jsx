
function Button(props){
    const variant = props.variant || 'Default';
    
    const getVariantClasses = () => {
        switch(variant) {
            case 'Default':
                return 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white';
            case 'Exit':
                return 'bg-red-500 hover:bg-red-600 text-white';
            case 'Confirm':
                return 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-md hover:shadow-lg';
            case 'Cancel':
                return 'bg-gray-500 hover:bg-gray-600 text-white';
            case 'Ghost':
                return 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300';
            case 'Primary':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            default:
                return 'bg-blue-500 hover:bg-blue-600 text-white';
        }
    };

    const borderRadius = props.rounded ? 'rounded-full' : 'rounded-lg';

    const isDisabled = Boolean(props.disabled);

    return (
        <button 
            disabled={isDisabled}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-none ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${getVariantClasses()} ${borderRadius}`}
            onClick={isDisabled ? undefined : props.onClick}
        >
            {props.label}
        </button>
    )
}

export default Button;