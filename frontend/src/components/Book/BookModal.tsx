import { useEffect, useRef, useState } from "react";
import { GenericButton, Modal } from "@/components/UI";

import { AlertCircleIcon, CalendarIcon, Trash2Icon, UserRoundIcon } from "lucide-react";

import { Book } from "@/types";
import { Tag } from "@/components/UI";
import { useOptions } from "@/contexts";
import {
    handleBorrowBook,
    handleDeleteBook,
    handleDisableBorrow,
    handleEnableBorrow,
    handleUnborrowBook,
} from "@/utils/book";

type BookModalProps = {
    book: Book;
    onClose: () => void;
};

function BookModal({ book, onClose }: BookModalProps) {
    const [borrowerInput, setBorrowerInput] = useState("");
    const { triggerRefresh } = useOptions();
    const [isModified, setIsModified] = useState(false);
    const [bookInfo, setBookInfo] = useState(book);
    const borrowerInputRef = useRef<HTMLInputElement>(null);

    const isBorrowed = !!bookInfo.borrowerName;
    const borrowAllowed = bookInfo.allowBorrow;

    const handleOnClose = (e: any) => {
        e.stopPropagation();
        if (isModified) {
            triggerRefresh("books");
        }
        onClose();
    };

    useEffect(() => {
        if (!isBorrowed && borrowerInputRef.current) {
            borrowerInputRef.current.focus();
        }
    }, [isBorrowed]);

    return (
        <Modal onClose={handleOnClose}>
            <div className="relative flex flex-col gap-5 mx-auto w-[40rem] rounded-lg bg-primary-50 dark:bg-gray-800  p-8 shadow-xl ring-1 ring-primary-400">
                <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-50 mb-2">
                        {bookInfo.title}
                    </h2>

                    <p className="flex items-center gap-2 text-lg text-slate-600 dark:text-slate-300">
                        <UserRoundIcon size={20} />
                        <span>
                            {bookInfo.author ? bookInfo.author.name : "Unknown"}
                        </span>
                    </p>

                    <div className="date-added flex items-center gap-2 text-slate-600/80 dark:text-slate-300/80">
                        <CalendarIcon size={16} />
                        <span className="opacity-75">
                            {bookInfo.getDateAdded(true)}
                        </span>
                    </div>

                    <div className="flex">
                        <ul className="flex gap-2 flex-wrap text-xs flex-grow">
                            {bookInfo.genres.map((genre, index) => {
                                return (
                                    <Tag
                                        key={index}
                                        as={"li"}
                                        label={genre.name}
                                        size={14}
                                    />
                                );
                            })}
                        </ul>
                        <button
                            className="min-w-6 h-6 px-2"
                            onClick={() => {
                                handleDeleteBook({
                                    book: bookInfo,
                                    callback: () => {
                                        triggerRefresh("books");
                                        onClose();
                                    },
                                });
                            }}
                        >
                            <Trash2Icon className="text-error-600 hover:text-error-500 hover:cursor-pointer hover:scale-110 dt" />
                        </button>
                    </div>
                </div>

                <hr className="border-slate-400/40 dark:border-slate-600/40" />

                {/* Borrowing area ----------------------------------------------------- */}
                <section className="flex flex-col w-full gap-3">
                    <div className="flex justify-between items-center w-full">
                        <h4 className="text-xl font-semibold">Borrowing Status</h4>
                        <GenericButton
                            color={borrowAllowed ? "error" : "success"}
                            disabled={borrowAllowed && isBorrowed}
                            onClick={() => {
                                const borrowToggleHandler = borrowAllowed
                                    ? handleDisableBorrow
                                    : handleEnableBorrow;

                                borrowToggleHandler(bookInfo.id, () => {
                                    setIsModified(true);
                                    setBookInfo((prev) => {
                                        return {
                                            ...prev,
                                            allowBorrow: !borrowAllowed,
                                        };
                                    });
                                });
                            }}
                        >
                            <span className="font-medium px-1">
                                {borrowAllowed
                                    ? isBorrowed
                                        ? "Cannot Disable While Borrowed"
                                        : "Disable Borrowing"
                                    : "Enable Borrowing"}
                            </span>
                        </GenericButton>
                    </div>

                    <div className="h-32">
                        {borrowAllowed ? (
                            <>
                                {isBorrowed ? (
                                    <div className="flex flex-col h-full">
                                        {/* Warning panel */}
                                        <div
                                            className="flex flex-col h-full justify-around rounded-md
                                            bg-teal-800 dark:bg-teal-800/60 px-6 py-4"
                                        >
                                            <p className="flex items-center gap-1 text-teal-300">
                                                <AlertCircleIcon size={18} />
                                                Currently borrowed by
                                                <span className="font-bold text-amber-50">
                                                    {bookInfo.borrowerName}
                                                </span>
                                            </p>

                                            <GenericButton
                                                onClick={() => {
                                                    handleUnborrowBook({
                                                        bookId: bookInfo.id,
                                                        callback: () => {
                                                            setIsModified(true);
                                                            setBookInfo((prev) => {
                                                                return {
                                                                    ...prev,
                                                                    borrowerName: "",
                                                                };
                                                            });
                                                        },
                                                    });
                                                }}
                                                color="success"
                                            >
                                                Mark as Returned
                                            </GenericButton>
                                        </div>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                        }}
                                        className="flex flex-col justify-around h-full"
                                    >
                                        {/* Lend-book form */}
                                        <input
                                            ref={borrowerInputRef}
                                            type="text"
                                            value={borrowerInput}
                                            placeholder="Enter borrower's name"
                                            onChange={(e) =>
                                                setBorrowerInput(e.target.value)
                                            }
                                            className="w-full rounded-md bg-slate-300 dark:bg-slate-700 px-4 py-3
                                                text-slate-900 dark:text-slate-100
                                                placeholder:text-slate-600/80 dark:placeholder-slate-400 focus:outline-none
                                                focus:ring-2 focus:ring-primary-400 focus:dark:ring-primary-500"
                                        />
                                        <GenericButton
                                            type="submit"
                                            disabled={!borrowerInput.trim()}
                                            size="medium"
                                            onClick={() => {
                                                handleBorrowBook({
                                                    bookId: bookInfo.id,
                                                    borrowerName: borrowerInput,
                                                    callback: () => {
                                                        setIsModified(true);
                                                        setBookInfo((prev) => {
                                                            return {
                                                                ...prev,
                                                                borrowerName:
                                                                    borrowerInput,
                                                            };
                                                        });
                                                        setBorrowerInput("");
                                                    },
                                                });
                                            }}
                                        >
                                            <span className="font-medium">
                                                Lend Book
                                            </span>
                                        </GenericButton>
                                    </form>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center rounded-md bg-orange-950/90 dark:bg-amber-950/60 px-6 h-full">
                                <p className="flex items-center gap-2 text-amber-200 dark:text-amber-200">
                                    <AlertCircleIcon size={18} />
                                    Borrowing is disabled for this book.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </Modal>
    );
}

export default BookModal;
