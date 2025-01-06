import { SearchIcon } from "lucide-react";
import { useState } from "react";

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
                        bg-primary-100 dark:bg-primary-700
                        placeholder-primary-300 dark:placeholder-primary-300 
                        border border-primary-700 dark:border-primary-600
                    "
                />
                <SearchIcon className="absolute left-3 top-2.5 w-5 h-5" />
            </div>
            <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3 py-2 rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-primary-400 dark:focus:ring-primary-500
                    bg-primary-100 dark:bg-primary-700
                    border border-primary-700 dark:border-primary-600
                "
            >
                <option value="all">All Fields</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
            </select>
        </form>
    );
}

export default SearchBar;
