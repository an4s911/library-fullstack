import { Moon, Sun } from "lucide-react";
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
        <div
            onClick={() => setIsDark(!isDark)}
            className="cursor-pointer w-6 h-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
        >
            {isDark ? (
                <Sun className="w-full h-full" />
            ) : (
                <Moon className="w-full h-full" />
            )}
        </div>
    );
}

export default ThemeToggle;
