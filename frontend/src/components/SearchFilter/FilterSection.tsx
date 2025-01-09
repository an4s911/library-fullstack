import { ChevronDownIcon, ChevronUpIcon, FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FilterCheckboxListLoader } from "../SkeletonLoaders";

type Author = {
    id: number;
    name: string;
};

type Genre = {
    id: number;
    name: string;
};

type FliterCheckboxItem = Author | Genre;

type FilterCheckboxListProps = {
    header: string;
    fetchUrl: string;
};

function FilterCheckboxList({ header, fetchUrl }: FilterCheckboxListProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [list, setList] = useState<FliterCheckboxItem[]>([]);
    const [shorterList, setShorterList] = useState<FliterCheckboxItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isExpanded) setShorterList(list);
        else setShorterList(list.slice(0, 6));
    }, [isExpanded, isLoading]);

    useEffect(() => {
        setIsLoading(true);

        fetch(fetchUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setList(data[header.toLowerCase()]);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return isLoading ? (
        <FilterCheckboxListLoader />
    ) : (
        <div className="relative">
            <h3>{header}</h3>
            <ul>
                {shorterList.map((listItem, index) => {
                    return (
                        <li key={index} className="flex items-center gap-2">
                            <input
                                id={`${listItem.name}-${index}`}
                                type="checkbox"
                                name=""
                            />
                            <label htmlFor={`${listItem.name}-${index}`}>
                                {listItem.name}
                            </label>
                        </li>
                    );
                })}
                <li className="sticky bottom-0 bg-primary-50 dark:bg-primary-800 pt-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-primary hover:underline text-sm flex items-center"
                    >
                        <span>
                            {isExpanded ? "Show Less" : `Show All (${list.length})`}
                        </span>
                        {isExpanded ? (
                            <ChevronUpIcon size={18} />
                        ) : (
                            <ChevronDownIcon size={18} />
                        )}
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
            py-3 rounded-md shadow h-full sticky top-28 gap-3"
        >
            <div className="flex justify-between items-center">
                <h2>Filter</h2>
                <FilterIcon
                    size={26}
                    className="text-primary fill-primary-300 dark:fill-primary-600"
                />
            </div>
            <div className="flex flex-col gap-5 overflow-y-scroll">
                <FilterCheckboxList header="Authors" fetchUrl="/api/get-authors/" />
                <FilterCheckboxList header="Genres" fetchUrl="/api/get-genres/" />
            </div>
        </section>
    );
}

export default FilterSection;
