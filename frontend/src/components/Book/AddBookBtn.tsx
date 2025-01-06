import { PlusIcon } from "lucide-react";
import { GenericButton } from "../UI";

type AddBookBtnProps = {};

function AddBookBtn({}: AddBookBtnProps) {
    return (
        <GenericButton onClick={() => {}}>
            <PlusIcon size={20} />
            <div>Add Book</div>
        </GenericButton>
    );
}

export default AddBookBtn;
