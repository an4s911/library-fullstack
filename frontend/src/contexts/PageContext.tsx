import { createContext, useContext, useState } from "react";

interface PageContextType {
    totalPages: number;
    currentPage: number;
    setTotalPages: (totalPages: number) => void;
    setCurrentPage: (currentPage: number) => void;
    nextPage: () => void;
    prevPage: () => void;
}

export const PageContext = createContext<PageContextType>({} as PageContextType);

export const PageContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const nextPage = () => {
        if (currentPage === totalPages) return;
        setCurrentPage((page) => page + 1);
    };

    const prevPage = () => {
        if (currentPage === 1) return;
        setCurrentPage((prevPage) => prevPage - 1);
    };

    return (
        <PageContext.Provider
            value={{
                totalPages,
                currentPage,
                setTotalPages,
                setCurrentPage,
                nextPage,
                prevPage,
            }}
        >
            {children}
        </PageContext.Provider>
    );
};

export const usePageContext = () => {
    return useContext(PageContext);
};
