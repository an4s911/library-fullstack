import { ArrowDownUpIcon } from "lucide-react";
import { useState } from "react";
import GenericSelect from "../UI/GenericSelect";

type SortSectionProps = {};

function SortSection({}: SortSectionProps) {
    const [sortBy, setSortBy] = useState("title");
    const [isAscending, setIsAscending] = useState(true);

    return (
        <section className="sort-section flex items-center gap-2 bg-primary-100 dark:bg-primary-900 ml-1 pl-2 p-1 rounded-xl">
            <ArrowDownUpIcon className="text-primary-400 dark:text-primary-500" />
            <GenericSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                optionsList={[
                    {
                        value: "title",
                        label: "Title",
                    },
                    {
                        value: "author",
                        label: "Author",
                    },
                    {
                        value: "date-added",
                        label: "Date Added",
                    },
                ]}
            />
            <GenericSelect
                value={isAscending ? "asc" : "desc"}
                onChange={(e) => setIsAscending(e.target.value === "asc")}
                optionsList={[
                    {
                        value: "asc",
                        label: "Ascending",
                    },
                    {
                        value: "desc",
                        label: "Descending",
                    },
                ]}
            />
        </section>
    );
}

export default SortSection;
