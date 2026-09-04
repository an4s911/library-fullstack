import { usePageContext } from "@/contexts";
import { useOptions } from "@/contexts";
import { ChevronLeft, ChevronRight, ChevronsDown, List } from "lucide-react";
import { useEffect, useState } from "react";

type PageNavProps = {};

function PageNav({}: PageNavProps) {
    const { totalPages, currentPage, nextPage, prevPage, setCurrentPage } =
        usePageContext();
    const { setOptions, bookDisplayMode, setBookDisplayMode } = useOptions();
    const [currentPageValue, setCurrentPageValue] = useState(currentPage);

    useEffect(() => {
        setCurrentPageValue(currentPage);
    }, [currentPage]);

    const changeDisplayMode = (mode: "paged" | "all") => {
        setBookDisplayMode(mode);
        setCurrentPage(1);
        setOptions((previousOptions) => ({
            ...previousOptions,
            pg_num: 1,
        }));
    };

    if (totalPages <= 1 && bookDisplayMode === "paged") return null;

    if (bookDisplayMode === "all") {
        return (
            <div className="flex items-center self-center rounded-xl bg-transparent p-1 md:bg-primary-100 md:dark:bg-primary-900">
                <button
                    type="button"
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-200 dark:text-primary-200 dark:hover:bg-primary-700"
                    onClick={() => changeDisplayMode("paged")}
                    aria-label="Return to page-by-page browsing"
                >
                    <List size={17} aria-hidden="true" />
                    <span>Page by page</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 self-center rounded-xl bg-transparent p-1 md:ml-1 md:bg-primary-100 md:dark:bg-primary-900">
            <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-primary-700"
                onClick={prevPage}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <ChevronLeft />
            </button>
            <div>
                <form
                    className="inline"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setCurrentPage(currentPageValue);
                    }}
                >
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        className="no-spinner text-center w-min outline-none bg-transparent p-1 m-0
                        border-primary border-[1px] rounded-md"
                        value={currentPageValue}
                        onChange={(e) => {
                            setCurrentPageValue(() => {
                                const newValue = parseInt(e.target.value);
                                return newValue > totalPages
                                    ? totalPages
                                    : newValue < 1
                                      ? 1
                                      : newValue;
                            });
                        }}
                    />
                </form>{" "}
                of {totalPages}
            </div>
            <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-primary-700"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <ChevronRight />
            </button>
            <span className="mx-1 h-5 w-px bg-primary-300 dark:bg-primary-600" />
            <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-200 dark:text-primary-200 dark:hover:bg-primary-700"
                onClick={() => changeDisplayMode("all")}
            >
                <ChevronsDown size={17} aria-hidden="true" />
                <span>Show all</span>
            </button>
        </div>
    );
}

export default PageNav;
