export default function Input(props, onValueChange) {

    const handleChange = (e) => {
        const v = e.target.value;
        if (typeof onValueChange === 'function') onValueChange(v); // envia só o valor
        if (typeof onChange === 'function') onChange(e); // compatibilidade
    };

    return (
        <input
            type= {props.type ?? 'text'}
            value={props.value ?? ''}
            onChange={handleChange}
            placeholder={props.placeholder ?? ''}
            required = {props.required ?? false}
            className="w-full h-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
        />
    )
}