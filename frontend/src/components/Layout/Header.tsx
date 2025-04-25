import { LibraryIcon, LogOutIcon } from "lucide-react";
import { AddBookBtn } from "@/components/Book";
import { SearchBar } from "@/components/SearchFilter";
import { ThemeToggle } from "@/components/Layout";

type HeaderProps = {
    onModalOpen: () => void;
    onModalClose: () => void;
};

function Header({ onModalOpen, onModalClose }: HeaderProps) {
    return (
        <header
            className="flex justify-between items-center bg-primary-50 dark:bg-primary-800
            fixed top-0 w-full shadow px-20 h-20 py-4 z-20"
        >
            <a href="/" className="title-logo flex items-center gap-2">
                <div className="logo text-primary">
                    <LibraryIcon size={32} />
                </div>
                <div className="title text-2xl font-bold">
                    <h1>A-Library</h1>
                </div>
            </a>

            <div className="search-bar flex-1 max-w-lg min-w-max">
                <SearchBar />
            </div>

            <div className="actions flex items-center gap-3">
                <div className="theme-toggle">
                    <ThemeToggle />
                </div>
                <div className="add-book-btn">
                    <AddBookBtn onModalOpen={onModalOpen} onModalClose={onModalClose} />
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
