type FilterCheckboxListProps = {};

function FilterCheckboxList({}: FilterCheckboxListProps) {
    return (
        <div className="flex flex-col gap-3">
            <h3 className="h-5 w-28 bg-primary-200 dark:bg-primary-600 rounded animate-pulse"></h3>
            <ul className="flex flex-col gap-2">
                {Array.from({ length: Math.floor(Math.random() * 4) + 4 }).map(
                    (_, index) => {
                        return (
                            <li key={index} className="flex items-center gap-1">
                                <div className="h-4 w-4 bg-primary-200 dark:bg-primary-600 rounded animate-pulse"></div>
                                <div className="h-4 w-28 bg-primary-200 dark:bg-primary-600 rounded animate-pulse"></div>
                            </li>
                        );
                    },
                )}
            </ul>
        </div>
    );
}

export default FilterCheckboxList;
