import { fetchApi, getCSRFToken } from "@/utils";

type handleBorrowProps = {
    bookId: number;
    borrowerName: string;
    callback: () => void;
};

const handleBorrow = ({ bookId, borrowerName, callback }: handleBorrowProps) => {
    fetchApi(
        `/api/borrow-book/${bookId}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
            body: JSON.stringify({
                borrowerName: borrowerName,
            }),
        },
        {
            okCallback: callback,
        },
    );
};

export default handleBorrow;
