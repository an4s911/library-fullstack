import { SearchIcon } from "lucide-react";
import { useState } from "react";

type SearchBarProps = {};

function SearchBar({}: SearchBarProps) {
    const [value, setValue] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    return (
        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="search-field flex-1 relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search books..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg dark:bg-primary-800 dark:text-white dark:placeholder-gray-400
                        dark:border-gray-600 bg-white text-gray-900 placeholder-gray-500 border-gray-300 border focus:outline-none
                        focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500"
                />
                <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 dark:text-gray-400 text-gray-500" />
            </div>
            <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3 py-2 rounded-lg dark:bg-primary-800 dark:text-white dark:border-gray-600
                        bg-white text-gray-700 border-gray-300 border focus:outline-none focus:ring-2
                        focus:ring-primary-400 dark:focus:ring-primary-500"
            >
                <option value="all">All Fields</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
            </select>
        </form>
    );
}

export default SearchBar;
