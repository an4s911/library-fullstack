type GenericButtonProps = {
    children: React.ReactNode;
    onClick?: (e?: any) => void;
    disabled?: boolean;
    color?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "dull";
    size?: "mini" | "small" | "medium" | "large";
    type?: "button" | "submit" | "reset";
};

const colorClasses: { [key: string]: string } = {
    primary: "bg-primary text-white hover:bg-primary-500 dark:hover:bg-primary-400",
    secondary:
        "bg-secondary-600 text-white hover:bg-secondary-700 dark:hover:bg-secondary-700",
    success: "bg-success-600 text-white hover:bg-success-700 dark:hover:bg-success-700",
    error: "bg-error-600 text-white hover:bg-error-700 dark:hover:bg-error-700",
    warning: "bg-warning-600 text-white hover:bg-warning-700 dark:hover:bg-warning-700",
    info: "bg-info-600 text-white hover:bg-info-700 dark:hover:bg-info-700",
    dull: "bg-gray-600 text-white hover:bg-gray-700 dark:hover:bg-gray-700",
};

const sizeClasses: { [key: string]: string } = {
    mini: "text-xs px-4 py-1",
    small: "text-sm px-4 py-1",
    medium: "text-base px-3 py-2",
    large: "text-lg px-6 py-2",
};

function GenericButton({
    children,
    onClick,
    disabled = false,
    color = "primary",
    size = "medium",
    type = "button",
}: GenericButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`rounded-md flex gap-2 items-center justify-center transition-colors
            disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300
            dark:disabled:bg-gray-600 dark:disabled:text-gray-400 dark:disabled:hover:bg-gray-600
            disabled:cursor-not-allowed
            ${colorClasses[color]} ${sizeClasses[size]}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default GenericButton;
