import { LibraryIcon, LogOutIcon, SearchIcon, XIcon } from "lucide-react";
import { AddBookBtn } from "@/components/Book";
import { SearchBar } from "@/components/SearchFilter";
import { ThemeToggle } from "@/components/Layout";
import { useState } from "react";

type HeaderProps = {};

function Header({}: HeaderProps) {
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    return (
        <header
            className="flex flex-col md:flex-row md:justify-between items-center bg-primary-50 dark:bg-primary-800
            w-full shadow px-4 md:px-20 h-auto md:h-20 py-4 z-20 gap-4 md:gap-0"
        >
            <div className="w-full md:w-auto flex justify-between items-center">
                <a href="/" className="title-logo flex items-center gap-2">
                    <div className="logo text-primary">
                        <LibraryIcon size={32} />
                    </div>
                    <div className="title text-lg md:text-2xl font-bold">
                        <h1>{import.meta.env.VITE_APP_NAME}</h1>
                    </div>
                </a>

                {/* Mobile Actions */}
                <div className="flex md:hidden items-center gap-3">
                     <button
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                        className="text-primary-900 dark:text-primary-100"
                    >
                        {showMobileSearch ? <XIcon size={24} /> : <SearchIcon size={24} />}
                    </button>
                    <div className="theme-toggle">
                        <ThemeToggle />
                    </div>
                    <div className="add-book-btn">
                        <AddBookBtn />
                    </div>
                    <div className="logout">
                        <a href="/logout/">
                            <LogOutIcon
                                size={24}
                                strokeWidth={3}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:scale-105"
                            />
                        </a>
                    </div>
                </div>
            </div>

            {/* Desktop Search Bar - Hidden on mobile */}
            <div className="hidden md:block search-bar flex-1 max-w-lg min-w-max mx-4">
                <SearchBar />
            </div>

             {/* Mobile Search Bar - Visible when toggled */}
             {showMobileSearch && (
                <div className="md:hidden w-full">
                    <SearchBar />
                </div>
            )}

            {/* Desktop Actions - Hidden on mobile */}
            <div className="hidden md:flex actions items-center gap-3">
                <div className="theme-toggle">
                    <ThemeToggle />
                </div>
                <div className="add-book-btn">
                    <AddBookBtn />
                </div>
                <div className="logout">
                    <a href="/logout/">
                        <LogOutIcon
                            size={24}
                            strokeWidth={3}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:scale-105"
                        />
                    </a>
                </div>
            </div>
        </header>
    );
}

export default Header;
