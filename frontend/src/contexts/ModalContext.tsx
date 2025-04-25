import { createContext, useContext, useState } from "react";

interface ModalContextType {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onModalOpen: () => void;
    onModalClose: () => void;
}

export const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onModalOpen = () => setIsModalOpen(true);
    const onModalClose = () => setIsModalOpen(false);

    return (
        <ModalContext.Provider
            value={{ isModalOpen, setIsModalOpen, onModalOpen, onModalClose }}
        >
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    return useContext(ModalContext);
};
