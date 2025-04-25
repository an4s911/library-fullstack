import { ChevronLeft, ChevronRight } from "lucide-react";

type PageNavProps = {
    totalPages: number;
    currentPage: number;
    nextPage: () => void;
    prevPage: () => void;
};

function PageNav({ totalPages, currentPage, nextPage, prevPage }: PageNavProps) {
    return (
        <div className="flex gap-2 items-center self-center">
            <button
                className="flex justify-center items-center cursor-pointer
                w-8 h-8 hover:border-primary hover:border-[1px]
                rounded-md"
                onClick={prevPage}
            >
                <ChevronLeft />
            </button>
            <div>
                {currentPage} of {totalPages}
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
