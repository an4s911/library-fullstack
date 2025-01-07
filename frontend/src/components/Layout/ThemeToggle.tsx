import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeToggleProps = {};

function ThemeToggle({}: ThemeToggleProps) {
    const [isDark, setIsDark] = useState(
        localStorage.getItem("theme")
            ? localStorage.getItem("theme") === "dark"
            : true,
    );

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="cursor-pointer flex items-center w-7 h-7 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
        >
            {isDark ? (
                <SunIcon className="w-full h-full" />
            ) : (
                <MoonIcon className="w-full h-full" />
            )}
        </button>
    );
}

export default ThemeToggle;
