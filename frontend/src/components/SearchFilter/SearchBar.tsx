import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { GenericSelect } from "@/components/UI";

type SearchBarProps = {};

function SearchBar({}: SearchBarProps) {
    const [value, setValue] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    return (
        <form
            className="flex gap-2 text-primary-900 dark:text-primary-100"
            onSubmit={(e) => e.preventDefault()}
        >
            <div className="search-field flex-1 relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search books..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg
                        focus:outline-none focus:ring-2
                        focus:ring-primary-400 dark:focus:ring-primary-500
                        bg-primary-200 dark:bg-primary-700
                        placeholder-primary-400 dark:placeholder-primary-300 
                        border border-primary-700 dark:border-primary-600
                    "
                />
                <SearchIcon className="absolute left-3 top-2.5 w-5 h-5" />
            </div>
            <GenericSelect
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                optionsList={[
                    {
                        value: "all",
                        label: "All Fields",
                    },
                    {
                        value: "title",
                        label: "Title",
                    },
                    {
                        value: "author",
                        label: "Author",
                    },
                    {
                        value: "borrower",
                        label: "Borrower",
                    },
                ]}
            />
        </form>
    );
}

export default SearchBar;
