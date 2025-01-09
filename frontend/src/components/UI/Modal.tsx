import { createPortal } from "react-dom";

type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
};

function Modal({ children, onClose }: ModalProps) {
    return createPortal(
        <div className="h-screen w-screen absolute left-0 top-0 z-50">
            <div
                className="absolute w-full h-full bg-black opacity-50"
                onClick={onClose}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {children}
            </div>
        </div>,
        document.getElementById("modal") as HTMLElement,
    );
}

export default Modal;
