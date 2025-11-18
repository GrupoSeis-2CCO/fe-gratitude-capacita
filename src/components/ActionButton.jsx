export default function ActionButton({ icon, text, variant = "default", onClick, size = 'normal', disabled = false }) {
  // size: 'compact' | 'normal' | 'large'
  const sizeMap = {
    compact: { btn: 'p-2', icon: 'text-lg', text: 'text-sm' },
    normal: { btn: 'p-4', icon: 'text-2xl', text: 'text-base' },
    large: { btn: 'p-5', icon: 'text-3xl', text: 'text-lg' }
  };
  const chosen = sizeMap[size] || sizeMap.normal;

  const baseClasses = `w-full rounded-lg ${chosen.btn} flex items-center gap-3 transition-colors`;
  
  const variants = {
    // default: white but hover to a light orange tint to match theme
    default: "bg-white hover:bg-[#FFF4EB] border border-gray-200",
    danger: "bg-red-50 hover:bg-red-100 border border-red-200"
  };

  const textVariants = {
    default: "text-gray-700",
    danger: "text-red-700"
  };

  return (
    <button 
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onClick}
    >
      <span className={`${chosen.icon}`}>{icon}</span>
      <span className={`${textVariants[variant]} ${chosen.text} font-medium`}>{text}</span>
    </button>
  );
}
