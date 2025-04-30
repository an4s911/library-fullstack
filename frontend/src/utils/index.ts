import { toast } from "react-toastify";

const getCSRFToken = () => {
    const cookie = document.cookie;

    if (!cookie) return "";

    const csrftokenCookie = cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("csrftoken="))!;

    return csrftokenCookie.split("=")[1];
};

const fetchWithToast = async (
    input: RequestInfo | URL,
    init?: RequestInit,
    successCallback?: () => void,
) => {
    fetch(input, init)
        .then((res) => {
            if (res.ok) {
                successCallback && successCallback();
            }
            return res.json();
        })
        .then((data) => {
            if (data.error) {
                toast.error(data.error);
            } else if (data.message) {
                toast.success(data.message);
            }
        });
};

export { getCSRFToken, fetchWithToast };
