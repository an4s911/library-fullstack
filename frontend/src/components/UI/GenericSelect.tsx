type OptionItem = {
    value: string;
    label: string;
};

type GenericSelectProps = {
    optionsList: OptionItem[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

function GenericSelect({ optionsList, value, onChange }: GenericSelectProps) {
    return (
        <select
            value={value}
            onChange={onChange}
            className="px-3 py-2 rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-primary-400 dark:focus:ring-primary-500
                    bg-primary-100 dark:bg-primary-700
                    border border-primary-700 dark:border-primary-600
                "
        >
            {optionsList.map((option) => {
                return (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                );
            })}
        </select>
    );
}

export default GenericSelect;
