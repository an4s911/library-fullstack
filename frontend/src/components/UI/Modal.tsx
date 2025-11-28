import { XIcon } from "lucide-react";
import { createPortal } from "react-dom";

type ModalProps = {
    children: React.ReactNode;
    onClose: (e?: React.MouseEvent) => void;
};

function Modal({ children, onClose }: ModalProps) {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute w-full h-full bg-black opacity-50"
                onClick={onClose}
            />
            <div className="relative w-full h-full md:w-auto md:h-auto md:max-h-[90vh] md:max-w-[90vw] overflow-auto md:overflow-visible">
                <button
                    onClick={onClose}
                    className="fixed md:absolute z-50 right-4 top-4 text-slate-800 dark:text-slate-400
                    transition-colors dark:hover:text-slate-100 hover:text-slate-500 bg-white/50 dark:bg-black/50 rounded-full p-1 md:bg-transparent md:dark:bg-transparent"
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
