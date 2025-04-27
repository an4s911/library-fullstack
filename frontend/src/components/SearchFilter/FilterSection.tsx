import { ChevronDownIcon, ChevronUpIcon, FilterIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FilterCheckboxListLoader } from "@/components/SkeletonLoaders";
import { useOptions } from "@/contexts";
import { GenericButton } from "@/components/UI";

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
    name: string;
    fetchUrl: string;
    refresh: boolean;
};

function FilterCheckboxList({ name, fetchUrl, refresh }: FilterCheckboxListProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [list, setList] = useState<FliterCheckboxItem[]>([]);
    const [shorterList, setShorterList] = useState<FliterCheckboxItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const maxShownInList = 6;

    useEffect(() => {
        if (isExpanded) setShorterList(list);
        else setShorterList(list.slice(0, maxShownInList));
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
                setList(data[name]);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [refresh]);

    return isLoading ? (
        <FilterCheckboxListLoader />
    ) : (
        <div className="relative">
            <h3>{capitalizeWords(name)}</h3>
            <ul>
                {shorterList.map((listItem, index) => {
                    return (
                        <li key={index} className="flex items-center gap-2">
                            <input
                                id={`${listItem.name}-${index}`}
                                type="checkbox"
                                name={name}
                                value={listItem.id}
                            />
                            <label htmlFor={`${listItem.name}-${index}`}>
                                {listItem.name}
                            </label>
                        </li>
                    );
                })}
                <li className="sticky bottom-0 bg-primary-50 dark:bg-primary-800 pt-1">
                    {list.length > maxShownInList && (
                        <span
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-primary hover:underline text-sm flex items-center cursor-pointer"
                        >
                            <span>
                                {isExpanded ? "Show Less" : `Show All (${list.length})`}
                            </span>
                            {isExpanded ? (
                                <ChevronUpIcon size={18} />
                            ) : (
                                <ChevronDownIcon size={18} />
                            )}
                        </span>
                    )}
                </li>
            </ul>
        </div>
    );
}

type FilterSectionProps = {};

function FilterSection({}: FilterSectionProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const { setOptions, refreshFilters } = useOptions();

    const handleSubmit = () => {
        const formElement = formRef.current!;
        const formData = new FormData(formElement);

        const authors = formData.getAll("authors").map(String);
        const genres = formData.getAll("genres").map(String);

        const borrowed = formData.get("borrowStatus") as string;

        setOptions((prevOptions) => {
            return {
                ...prevOptions,
                pg_num: 1,
                filter_author: authors,
                filter_genre: genres,
                filter_borrowed: borrowed,
            };
        });
    };

    return (
        <form
            ref={formRef}
            style={{
                maxHeight: "80vh",
                height: "80vh",
            }}
            className="filter-section flex flex-col bg-primary-50 dark:bg-primary-800 px-5
            py-3 rounded-md shadow gap-3"
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <div className="flex justify-between items-center">
                <h2>Filter</h2>
                <FilterIcon
                    size={26}
                    className="text-primary fill-primary-300 dark:fill-primary-600"
                />
            </div>
            <div className="flex flex-col gap-5 overflow-y-scroll">
                <FilterCheckboxList
                    refresh={refreshFilters}
                    name="authors"
                    fetchUrl="/api/get-authors/"
                />
                <FilterCheckboxList
                    refresh={refreshFilters}
                    name="genres"
                    fetchUrl="/api/get-genres/"
                />
                <div className="relative w-full">
                    <h3>Borrow Status</h3>
                    <ul className="flex gap-2 flex-col w-full">
                        {[
                            { label: "Any", value: "null" },
                            { label: "Borrowed", value: "true" },
                            { label: "Not Borrowed", value: "false" },
                        ].map((status, index) => {
                            const id = `borrowStatus${capitalizeWords(status.label)}`;
                            return (
                                <li key={index} className="flex items-center gap-2">
                                    <input
                                        id={id}
                                        type="radio"
                                        name="borrowStatus"
                                        value={status.value}
                                        defaultChecked={status.value === "null"}
                                    />
                                    <label htmlFor={id} className="w-full">
                                        {status.label}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className="actions flex gap-3 w-full">
                <GenericButton type="submit" color="primary" size="mini">
                    Apply
                </GenericButton>
                <GenericButton
                    type="reset"
                    onClick={() => {
                        formRef.current!.reset();
                        handleSubmit();
                    }}
                    size="mini"
                    color="dull"
                >
                    Clear
                </GenericButton>
            </div>
        </form>
    );
}

const capitalizeWords = (str: string) => {
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export default FilterSection;
