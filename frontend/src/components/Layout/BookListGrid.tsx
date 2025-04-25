import { useEffect, useState } from "react";
import { BookCard } from "@/components/Book";
import { BookListGridLoader } from "@/components/SkeletonLoaders";
import { Book } from "@/types";
import { BookIcon } from "lucide-react";
import { PageNav } from "@/components/Layout";
import { useOptions } from "@/contexts/OptionsContext";

type PageInfoProps = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
};

type BookListGridProps = {
    isGrid: boolean;
};

function BookListGrid({ isGrid }: BookListGridProps) {
    const [bookList, setBookList] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageInfo, setPageInfo] = useState<PageInfoProps | any>({});
    const { options, setOptions, toQueryParams } = useOptions();

    useEffect(() => {
        setIsLoading(true);

        const searchParamString = toQueryParams(options);

        fetch(`/api/get-books/?${searchParamString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setBookList(data.books);
                setPageInfo({
                    currentPage: data.currentPage,
                    totalPages: data.totalPages,
                    totalItems: data.totalItems,
                });
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [options]);

    if (isLoading) {
        return <BookListGridLoader isGrid={isGrid} />;
    } else {
        return bookList.length > 0 ? (
            <div className="flex flex-col w-full gap-10 justify-between h-full">
                <div
                    className={`book-list-grid gap-5 ${isGrid ? "grid grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}
                >
                    {bookList.map((book) => {
                        return <BookCard isGrid={isGrid} book={book} key={book.id} />;
                    })}
                </div>
                <PageNav
                    totalPages={pageInfo.totalPages}
                    currentPage={pageInfo.currentPage}
                    nextPage={() => {
                        if (pageInfo.currentPage === pageInfo.totalPages) return;
                        setOptions({ ...options, pg_num: pageInfo.currentPage + 1 });
                    }}
                    prevPage={() => {
                        if (pageInfo.currentPage === 1) return;
                        setOptions({ ...options, pg_num: pageInfo.currentPage - 1 });
                    }}
                />
            </div>
        ) : (
            <div
                className="w-full border border-primary-300 dark:border-primary-700
                    rounded-md p-4 flex gap-3 justify-center items-center"
            >
                <BookIcon />
                <h2 className="text-2xl">No books found</h2>
            </div>
        );
    }
}

export default BookListGrid;
