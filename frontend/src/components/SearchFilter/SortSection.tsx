import { ArrowDownUpIcon } from "lucide-react";
import { useRef, useState } from "react";
import { GenericSelect } from "../UI";
import { useOptions } from "@/contexts/OptionsContext";

type SortSectionProps = {};

function SortSection({}: SortSectionProps) {
    const [sortBy, setSortBy] = useState("title");
    const [isDescending, setIsDescending] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { setOptions } = useOptions();

    const handleSubmit = () => {
        const formElem = formRef.current!;
        const formData = new FormData(formElem);
        const sortBy = formData.get("sortBy") as string;
        const sortDesc = formData.get("sortDesc") as string;

        setOptions((prevOptions) => {
            return {
                ...prevOptions,
                pg_num: 1,
                sort_by: sortBy,
                sort_desc: sortDesc === "true",
            };
        });
    };

    return (
        <form
            ref={formRef}
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
            className="sort-section flex items-center gap-2 bg-primary-100 dark:bg-primary-900 ml-1 pl-2 p-1 rounded-xl"
        >
            <ArrowDownUpIcon className="text-primary-400 dark:text-primary-500" />
            <GenericSelect
                name="sortBy"
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
                        value: "dateAdded",
                        label: "Date Added",
                    },
                    {
                        value: "borrowerName",
                        label: "Borrower Name",
                    },
                    {
                        value: "borrowDate",
                        label: "Date Borrowed",
                    },
                ]}
            />
            <GenericSelect
                name="sortDesc"
                value={isDescending ? "true" : "false"}
                onChange={(e) => setIsDescending(e.target.value === "true")}
                optionsList={[
                    {
                        value: "false",
                        label: "Ascending",
                    },
                    {
                        value: "true",
                        label: "Descending",
                    },
                ]}
            />
            <button>Sort</button>
        </form>
    );
}

export default SortSection;
