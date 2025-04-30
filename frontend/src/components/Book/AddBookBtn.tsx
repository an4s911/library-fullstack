import { PlusIcon } from "lucide-react";
import { GenericButton } from "@/components/UI";
import { useState } from "react";
import { AddBookModal } from "@/components/Book";

type AddBookBtnProps = {};

function AddBookBtn({}: AddBookBtnProps) {
    const [open, setOpen] = useState(false);

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
