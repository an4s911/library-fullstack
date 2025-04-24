import { LayoutGridIcon, LayoutListIcon } from "lucide-react";

type LayoutToggleBtnProps = {
    isGrid: boolean;
    onClick: () => void;
};

function LayoutToggleBtn({ isGrid, onClick }: LayoutToggleBtnProps) {
    const iconClassName =
        "w-7 h-7 p-1 rounded-md relative transition-colors hover:text-primary-900 dark:hover:text-primary-100";

    return (
        <button
            onClick={onClick}
            className="layout-toggle-btn relative flex gap-1 rounded-xl bg-primary-300 dark:bg-primary-800
            items-center p-1.5 cursor-pointer text-primary-700 dark:text-primary-600 h-max mr-2"
        >
            <div
                className={`absolute w-7 h-7 bg-primary-50 dark:bg-primary-600 rounded-md left-1.5 right-1.5 top-1.5 ${
                    isGrid ? "translate-x-0" : "translate-x-[calc(100%+0.25rem)]"
                } transition-transform`}
            ></div>
            <LayoutGridIcon
                className={`${iconClassName} ${isGrid ? "text-primary dark:text-primary-200" : ""}`}
            />
            <LayoutListIcon
                className={`${iconClassName} ${!isGrid ? "text-primary dark:text-primary-200" : ""}`}
            />
        </button>
    );
}

export default LayoutToggleBtn;
