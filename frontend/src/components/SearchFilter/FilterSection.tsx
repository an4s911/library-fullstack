import { ChevronDownIcon, ChevronUpIcon, FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";

type FliterCheckboxItem = string;

type FilterCheckboxListProps = {
    header: string;
    list: FliterCheckboxItem[];
};

function FilterCheckboxList({ header, list }: FilterCheckboxListProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localList, setLocalList] = useState<FliterCheckboxItem[]>([]);

    useEffect(() => {
        if (!isExpanded) setLocalList(list.slice(0, 6));
        else setLocalList(list);
    }, [isExpanded]);

    return (
        <div className="">
            <h3>{header}</h3>
            <ul>
                {localList.map((listItem, index) => {
                    return (
                        <li key={listItem} className="flex items-center gap-2">
                            <input
                                id={`${listItem}-${index}`}
                                type="checkbox"
                                name=""
                            />
                            <label htmlFor={`${listItem}-${index}`}>
                                {listItem}
                            </label>
                        </li>
                    );
                })}
                <li>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-primary hover:underline text-sm"
                    >
                        <div className="flex items-center">
                            <span>
                                {isExpanded
                                    ? "Show Less"
                                    : `Show All (${list.length})`}
                            </span>
                            {isExpanded ? (
                                <ChevronUpIcon size={18} />
                            ) : (
                                <ChevronDownIcon size={18} />
                            )}
                        </div>
                    </button>
                </li>
            </ul>
        </div>
    );
}

type FilterSectionProps = {};

function FilterSection({}: FilterSectionProps) {
    return (
        <section
            style={{
                maxHeight: "80vh",
            }}
            className="filter-section flex flex-col bg-primary-50 dark:bg-primary-800 px-5
            py-3 rounded-md shadow h-max sticky top-28 gap-3"
        >
            <div className="flex justify-between items-center">
                <h2>Filter</h2>
                <FilterIcon
                    size={26}
                    className="text-primary fill-primary-300 dark:fill-primary-600"
                />
            </div>
            <div className="flex flex-col gap-3 overflow-y-scroll">
                <FilterCheckboxList
                    header="Authors"
                    list={[
                        "Author 1",
                        "Author 2",
                        "Author 3",
                        "Author 4",
                        "Author 5",
                        "Author 6",
                        "Author 7",
                        "Author 8",
                        "Author 9",
                    ]}
                />
                <FilterCheckboxList
                    header="Genres"
                    list={[
                        "Genre 1",
                        "Genre 2",
                        "Genre 3",
                        "Genre 4",
                        "Genre 5",
                        "Genre 6",
                        "Genre 7",
                        "Genre 8",
                        "Genre 9",
                        "Genre 10",
                        "Genre 11",
                        "Genre 12",
                        "Genre 13",
                        "Genre 14",
                        "Genre 15",
                        "Genre 16",
                        "Genre 17",
                        "Genre 18",
                        "Genre 19",
                        "Genre 20",
                    ]}
                />
            </div>
        </section>
    );
}

export default FilterSection;
