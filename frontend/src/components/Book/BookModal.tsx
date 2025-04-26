import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/UI";

import { AlertCircleIcon, CalendarIcon, UserRoundIcon, XIcon } from "lucide-react";

import { Book, createBook } from "@/types";
import { Tag } from "@/components/UI";
import { getCSRFToken } from "@/utils";
import { useOptions } from "@/contexts";

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

    const handleBorrow = () => {
        fetch(`/api/borrow-book/${bookInfo.id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
            body: JSON.stringify({
                borrowerName: borrowerInput,
            }),
        }).then((res) => {
            if (res.ok) {
                setIsModified(true);
                setBookInfo((prev) => {
                    return {
                        ...prev,
                        borrowerName: borrowerInput,
                    };
                });
                setBorrowerInput("");
            }
        });
    };

    const handleUnborrow = () => {
        fetch(`/api/unborrow-book/${bookInfo.id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
        }).then((res) => {
            if (res.ok) {
                setIsModified(true);
                setBookInfo((prev) => {
                    return {
                        ...prev,
                        borrowerName: "",
                    };
                });
            } else {
                throw new Error(res.statusText);
            }
        });
    };

    const handleChangeAllowBorrow = (newValue: boolean) => {
        fetch(`/api/edit-book/${bookInfo.id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
            body: JSON.stringify({
                allowBorrow: newValue,
            }),
        })
            .then((res) => {
                if (res.ok) {
                    setIsModified(true);
                    return res.json();
                }
            })
            .then((data) => {
                setBookInfo(createBook(data.book));
            });
    };

    const handleDisableBorrow = () => {
        handleChangeAllowBorrow(false);
    };
    const handleEnableBorrow = () => {
        handleChangeAllowBorrow(true);
    };

    useEffect(() => {
        if (!isBorrowed && borrowerInputRef.current) {
            borrowerInputRef.current.focus();
        }
    }, [isBorrowed]);

    return (
        <Modal onClose={handleOnClose}>
            <div className="relative flex flex-col gap-5 mx-auto w-[40rem] rounded-lg bg-primary-50 dark:bg-gray-800  p-8 shadow-xl ring-1 ring-primary-400">
                <button
                    onClick={handleOnClose}
                    className="absolute right-4 top-4 text-slate-800 dark:text-slate-400
                    transition-colors dark:hover:text-slate-100 hover:text-slate-500"
                >
                    <XIcon size={24} />
                </button>

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

                    <ul className="flex gap-2 flex-wrap text-xs">
                        {bookInfo.genres.map((genre, index) => {
                            return (
                                <Tag key={index} as={"li"} label={genre} size={14} />
                            );
                        })}
                    </ul>
                </div>

                <hr className="border-slate-400/40 dark:border-slate-600/40" />

                {/* Borrowing area ----------------------------------------------------- */}
                <section className="flex flex-col w-full gap-3">
                    <div className="flex justify-between items-center w-full">
                        <h4 className="text-xl font-semibold">Borrowing Status</h4>
                        {borrowAllowed ? (
                            <button
                                className={`ml-auto w-max rounded-md px-4 py-2 ${
                                    isBorrowed
                                        ? "cursor-not-allowed bg-slate-500/40 text-slate-500 dark:text-slate-300"
                                        : "bg-red-700 px-5 py-2 font-medium text-red-100 transition-colors hover:bg-red-600"
                                }`}
                                disabled={isBorrowed}
                                onClick={handleDisableBorrow}
                            >
                                {isBorrowed
                                    ? "Cannot Disable While Borrowed"
                                    : "Disable Borrowing"}
                            </button>
                        ) : (
                            <button
                                className={`ml-auto w-max rounded-md px-4 py-2 bg-green-700 font-medium text-green-100 transition-colors hover:bg-green-600`}
                                onClick={handleEnableBorrow}
                            >
                                Enable Borrowing
                            </button>
                        )}
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

                                            <button
                                                onClick={handleUnborrow}
                                                className="shadow-md rounded-md bg-blue-600 dark:bg-indigo-500 px-6 py-2 font-medium text-amber-100 transition-colors hover:bg-amber-600"
                                            >
                                                Mark as Returned
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="flex flex-col justify-around h-full">
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
                                        <button
                                            disabled={!borrowerInput.trim()}
                                            onClick={handleBorrow}
                                            className={`w-full rounded-md px-6 py-3 font-medium ${
                                                borrowerInput.trim()
                                                    ? "bg-primary-600 dark:bg-primary text-primary-100 hover:bg-primary-600"
                                                    : `cursor-not-allowed bg-primary-400 dark:bg-primary-700/40
                                                    dark:text-primary-200 text-primary-200`
                                            }`}
                                        >
                                            Lend Book
                                        </button>
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
