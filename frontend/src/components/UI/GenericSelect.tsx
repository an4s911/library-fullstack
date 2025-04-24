type OptionItem = {
    value: any;
    label: string;
};

type GenericSelectProps = {
    optionsList: OptionItem[];
    value: any;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
    required?: boolean;
};

function GenericSelect({
    optionsList,
    value,
    onChange,
    name,
    required = false,
}: GenericSelectProps) {
    return (
        <select
            name={name}
            value={value === -1 ? "" : value}
            onChange={onChange}
            className="px-3 py-2 rounded-lg w-full
                    focus:outline-none focus:ring-2
                    focus:ring-primary-400 dark:focus:ring-primary-500
                    bg-primary-200 dark:bg-primary-700
                    border border-primary-700 dark:border-primary-600"
            required={required}
        >
            {optionsList.map((option) => {
                return (
                    <option
                        key={option.value}
                        value={option.value === -1 ? "" : option.value}
                        disabled={option.value === -1}
                        defaultChecked
                    >
                        {option.label}
                    </option>
                );
            })}
        </select>
    );
}

export default GenericSelect;
