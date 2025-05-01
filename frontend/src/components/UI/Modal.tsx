import { XIcon } from "lucide-react";
import { createPortal } from "react-dom";

type ModalProps = {
    children: React.ReactNode;
    onClose: (e?: React.MouseEvent) => void;
};

function Modal({ children, onClose }: ModalProps) {
    return createPortal(
        <div className="h-screen w-screen absolute left-0 top-0 z-50">
            <div
                className="absolute w-full h-full bg-black opacity-50"
                onClick={onClose}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                    onClick={onClose}
                    className="absolute z-10 right-4 top-4 text-slate-800 dark:text-slate-400
                    transition-colors dark:hover:text-slate-100 hover:text-slate-500"
                >
                    <XIcon size={24} />
                </button>
                {children}
            </div>
        </div>,
        document.getElementById("modal") as HTMLElement,
    );
}

export default Modal;
