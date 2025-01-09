import { ChevronDownIcon, ChevronUpIcon, FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FilterCheckboxListLoader } from "../SkeletonLoaders";

type Author = {
    id: number;
    name: string;
};

type FliterCheckboxItem = Author;

type FilterCheckboxListProps = {
    header: string;
    list: FliterCheckboxItem[];
};

function FilterCheckboxList({ header, list }: FilterCheckboxListProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localList, setLocalList] = useState<FliterCheckboxItem[]>([]);

    useEffect(() => {
        if (isExpanded) setLocalList(list);
        else setLocalList(list.slice(0, 6));
    }, [isExpanded]);

    return (
        <div className="relative">
            <h3>{header}</h3>
            <ul>
                {localList.map((listItem, index) => {
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

type FilterSectionProps = {
    isLoading: boolean;
};

function FilterSection({ isLoading }: FilterSectionProps) {
    const [authorsList, setAuthorsList] = useState<Author[]>([]);

    useEffect(() => {
        fetch("/api/get-authors/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setAuthorsList(data.authors);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

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
            <div className="flex flex-col gap-5 overflow-y-scroll">
                {isLoading ? (
                    <>
                        <FilterCheckboxListLoader />
                        <FilterCheckboxListLoader />
                    </>
                ) : (
                    <>
                        <FilterCheckboxList header="Authors" list={authorsList} />
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
                    </>
                )}
            </div>
        </section>
    );
}

export default FilterSection;
