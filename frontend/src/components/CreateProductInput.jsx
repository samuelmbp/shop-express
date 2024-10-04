const CreateProductInput = ({
    label,
    type,
    name,
    value,
    onChange,
    id,
    step,
}) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-300"
            >
                {label}
            </label>

            {type === "textarea" ? (
                <textarea
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
						 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
						 focus:border-emerald-500"
                />
            ) : (
                <input
                    type={type}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    step={step}
                    required
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
						 px-3 text-white focus:outline-none focus:ring-2
						focus:ring-emerald-500 focus:border-emerald-500"
                />
            )}
        </div>
    );
};

export default CreateProductInput;
