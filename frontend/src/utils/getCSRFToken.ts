const getCSRFToken = () => {
    const cookie = document.cookie;

    if (!cookie) return "";

    const csrftokenCookie = cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("csrftoken="))!;

    return csrftokenCookie.split("=")[1];
};

export default getCSRFToken;
