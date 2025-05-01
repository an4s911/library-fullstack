import { SearchIcon } from "lucide-react";
import { GenericSelect } from "@/components/UI";
import { useOptions } from "@/contexts";

type SearchBarProps = {};

function SearchBar({}: SearchBarProps) {
    const { options, setOptions, triggerRefresh } = useOptions();

    const value = options.q ?? "";
    const setValue = (value: string) => {
        setOptions((prev) => {
            return {
                ...prev,
                pg_num: 1,
                q: value,
            };
        });
    };

    const searchFilter = options.search_in ?? "all";
    const setSearchFilter = (value: string) => {
        setOptions((prev) => {
            return {
                ...prev,
                pg_num: 1,
                search_in: value,
            };
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        triggerRefresh("books");
    };

    return (
        <form
            className="flex gap-2 text-primary-900 dark:text-primary-100"
            onSubmit={handleSubmit}
        >
            <div className="search-field flex-1 relative">
                <input
                    name="query"
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
                name="searchField"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                optionsList={[
                    {
                        value: "all",
                        label: "All",
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
