import { Plus } from "lucide-react";
import { GenericButton } from "../UI";

type AddBookBtnProps = {};

function AddBookBtn({}: AddBookBtnProps) {
    return (
        <GenericButton onClick={() => {}}>
            <Plus size={20} />
            <div>Add Book</div>
        </GenericButton>
    );
}

export default AddBookBtn;
