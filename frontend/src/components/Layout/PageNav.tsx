import { usePageContext } from "@/contexts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type PageNavProps = {};

function PageNav({}: PageNavProps) {
    const { totalPages, currentPage, nextPage, prevPage, setCurrentPage } =
        usePageContext();
    const [currentPageValue, setCurrentPageValue] = useState(currentPage);

    useEffect(() => {
        setCurrentPageValue(currentPage);
    }, [currentPage]);

    return (
        <div className="flex gap-2 items-center self-center bg-primary-100 dark:bg-primary-900 ml-1 p-1 rounded-xl">
            <button
                className="flex justify-center items-center cursor-pointer
                w-8 h-8 hover:border-primary hover:border-[1px]
                rounded-md"
                onClick={prevPage}
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
                        className="no-spinner text-center w-min outline-none bg-transparent p-1 m-0 border-[1px] rounded-md"
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
                className="flex justify-center items-center cursor-pointer
                w-8 h-8 hover:border-primary hover:border-[1px]
                rounded-md"
                onClick={nextPage}
            >
                <ChevronRight />
            </button>
        </div>
    );
}

export default PageNav;
