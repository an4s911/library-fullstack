import { PlusIcon } from "lucide-react";
import { GenericButton } from "@/components/UI";
import { useEffect, useState } from "react";
import AddBookModal from "@/components/Book/AddBookModal";

type AddBookBtnProps = {
    onModalOpen: () => void;
    onModalClose: () => void;
};

function AddBookBtn({ onModalOpen, onModalClose }: AddBookBtnProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        open ? onModalOpen() : onModalClose();
    }, [open]);

    return (
        <>
            <GenericButton
                onClick={() => {
                    setOpen(true);
                }}
            >
                <PlusIcon size={20} />
                <div>Add Book</div>
            </GenericButton>
            {open && (
                <AddBookModal
                    onClose={() => {
                        setOpen(false);
                    }}
                />
            )}
        </>
    );
}

export default AddBookBtn;
