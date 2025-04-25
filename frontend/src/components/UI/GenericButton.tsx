type GenericButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
};

function GenericButton({ children, onClick, disabled = false }: GenericButtonProps) {
    return (
        <button
            onClick={onClick}
            className="px-3 py-2 bg-primary text-white hover:bg-primary-500 dark:hover:bg-primary-400
            rounded-md flex gap-2 items-center"
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default GenericButton;
