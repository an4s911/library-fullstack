import { PlusIcon } from "lucide-react";
import { GenericButton } from "@/components/UI";
import { useEffect, useState } from "react";
import AddBookModal from "@/components/Book/AddBookModal";
import { useModal } from "@/contexts";

type AddBookBtnProps = {};

function AddBookBtn({}: AddBookBtnProps) {
    const [open, setOpen] = useState(false);
    const { onModalOpen, onModalClose } = useModal();

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
