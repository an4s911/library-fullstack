import { fetchApi } from "@/utils";
import { getCSRFToken } from "@/utils";

type handleChangeAllowBorrowProps = {
    bookId: number;
    newValue: boolean;
    callback: () => void;
};

const handleChangeAllowBorrow = ({
    bookId,
    newValue,
    callback,
}: handleChangeAllowBorrowProps) => {
    fetchApi(
        `/api/edit-book/${bookId}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
            body: JSON.stringify({
                allowBorrow: newValue,
            }),
        },
        {
            okCallback: callback,
        },
    );
};

const handleDisableBorrow = (bookId: number, callback: () => void) => {
    handleChangeAllowBorrow({ bookId, newValue: false, callback });
};
const handleEnableBorrow = (bookId: number, callback: () => void) => {
    handleChangeAllowBorrow({ bookId, newValue: true, callback });
};

export { handleDisableBorrow, handleEnableBorrow };
