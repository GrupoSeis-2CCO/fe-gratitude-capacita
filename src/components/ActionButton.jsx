export default function ActionButton({ icon, text, variant = "default", onClick }) {
  const baseClasses = "w-full rounded-lg p-4 flex items-center gap-3 transition-colors";
  
  const variants = {
    default: "bg-white hover:bg-gray-50 border border-gray-200",
    danger: "bg-red-50 hover:bg-red-100 border border-red-200"
  };

  const textVariants = {
    default: "text-gray-700",
    danger: "text-red-700"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
    >
      <span className="text-2xl">{icon}</span>
      <span className={`${textVariants[variant]} font-medium`}>{text}</span>
    </button>
  );
}
