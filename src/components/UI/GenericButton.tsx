type GenericButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
};

function GenericButton({ children, onClick }: GenericButtonProps) {
    return (
        <button
            onClick={onClick}
            className="px-3 py-2 bg-primary text-white dark:bg-primary-dark hover:bg-primary-dark
                dark:hover:bg-primary rounded-md flex gap-2 items-center"
        >
            {children}
        </button>
    );
}

export default GenericButton;
