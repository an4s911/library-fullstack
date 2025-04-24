import { ChevronDownIcon } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

interface DropdownOption {
    value: string | number | null;
    label: string;
}

interface SimpleDropdownProps {
    options: DropdownOption[];
    placeholder?: string;
    label?: string;
    onSelect?: (selectedOption: DropdownOption | null) => void;
    onAddOption?: (newOptionLabel: string) => string;
    initialSelectedValue?: string | null;
    inputName?: string;
}

function SimpleDropdown({
    options,
    placeholder = "Select or type...",
    label,
    onSelect,
    onAddOption,
    initialSelectedValue = null,
    inputName,
}: SimpleDropdownProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
    const [newOptionLabel, setNewOptionLabel] = useState<string>("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null); // Ref for the input element

    // Initialize selected option and search term based on initialSelectedValue prop
    useEffect(() => {
        if (initialSelectedValue) {
            const initialOption = options.find(
                (opt) => opt.value === initialSelectedValue,
            );
            if (initialOption) {
                setSelectedOption(initialOption);
                setSearchTerm(initialOption.label); // Display label in input when initially selected
            } else {
                setSelectedOption(null);
                setSearchTerm("");
            }
        } else {
            setSelectedOption(null);
            setSearchTerm("");
        }
        setIsOpen(false); // Ensure dropdown is closed initially
    }, [initialSelectedValue, options]);

    // Filter options based on search term (case-insensitive contains)
    const filteredOptions = useMemo(() => {
        // If an option is selected, don't show dropdown options while input has its label
        // User must change input to see options again
        if (!searchTerm || selectedOption?.label === searchTerm) {
            return options; // Show all options if search is empty or matches selected
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return options.filter((option) =>
            option.label.toLowerCase().includes(lowerSearchTerm),
        );
    }, [options, searchTerm, selectedOption]);

    // Handle clicking outside the dropdown to close it
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                // If nothing is selected, clear the search term when closing
                // If something is selected, reset search term to the selected option's label
                if (selectedOption) {
                    setSearchTerm(selectedOption.label);
                } else {
                    // Keep search term if user typed something but didn't select
                    // This behavior might need adjustment based on exact UX desired
                    // For now, let's clear it if nothing is selected
                    // setSearchTerm(""); // Reverted: Keep term if user clicks out while searching
                }
            }
        },
        [selectedOption],
    ); // Removed dropdownRef dependency as it's stable

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]); // Dependency is the stable callback

    useEffect(() => {
        if (newOptionLabel !== "") {
            const newOption: DropdownOption = options.find(
                (opt) => opt.label.toLowerCase() === newOptionLabel.toLowerCase(),
            )!;
            handleOptionClick(newOption);
            setNewOptionLabel("");
        }
    }, [options]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);

        // If user types, clear the current selection
        if (selectedOption) {
            setSelectedOption(null);
            if (onSelect) {
                onSelect(null); // Notify parent that selection is cleared
            }
        }

        if (!isOpen) {
            setIsOpen(true); // Open dropdown when typing starts
        }
    };

    const handleInputFocus = () => {
        inputRef.current?.focus();
        setIsOpen(true);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            event.preventDefault(); // Prevent potential default behavior
            event.stopPropagation();
            if (isOpen) {
                event.preventDefault(); // Prevent potential default behavior
                setIsOpen(false);
                // Reset search term to selected label if applicable, otherwise keep current term
                // User might want to press Esc and then Enter without retyping
                if (selectedOption) {
                    setSearchTerm(selectedOption.label);
                }
                // Do not blur, keep focus
            }
        } else if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission

            const trimmedSearchTerm = searchTerm.trim();

            if (!isOpen && trimmedSearchTerm === "") {
                // If dropdown closed or search is empty, Enter does nothing special
                // (or could potentially select the first item if open?)
                setIsOpen(false); // Ensure closed
                return;
            }

            if (filteredOptions.length === 0 && onAddOption) {
                // confirm choice from user with alert
                const shouldAdd = window.confirm(
                    `Add "${trimmedSearchTerm}" as a new ${label ? label.toLowerCase() : "option"}?`,
                );
                if (!shouldAdd) {
                    return;
                }

                setNewOptionLabel(onAddOption(trimmedSearchTerm)); // Call parent function to handle adding
            } else if (filteredOptions.length > 0) {
                // Select the first filtered option on Enter
                setIsOpen(false);
                if (selectedOption) {
                    setSearchTerm(selectedOption.label);
                } else {
                    const firstFilteredOption = filteredOptions[0];
                    handleOptionClick(firstFilteredOption);
                }
            } else {
                // No filtered options, but no onAddOption callback provided. Just close.
                setIsOpen(false);
                if (selectedOption) {
                    setSearchTerm(selectedOption.label);
                }
            }
        } else if (event.key === "Tab") {
            setIsOpen(false);
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            // down arrow
            // up arrow
            // arrow keys will navigate through the filtered options
        } else if (!isOpen && event.key.length === 1) {
            // If dropdown is closed and user starts typing a character, open it
            setIsOpen(true);
        }
    };

    const handleOptionClick = (option: DropdownOption) => {
        setSelectedOption(option);
        setSearchTerm(option.label); // Update input field to show selected label
        setIsOpen(false);
        if (onSelect) {
            onSelect(option); // Notify parent of the selection
        }

        // Focus next input field in the form
        const currentInput = inputRef.current;
        if (currentInput && currentInput.form) {
            const formElements = Array.from(currentInput.form.elements);
            const index = formElements.indexOf(currentInput);
            const nextElement = formElements[index + 1] as HTMLElement | undefined;

            if (nextElement && typeof nextElement.focus === "function") {
                nextElement.focus();
            }
        }
    };

    return (
        <div className="w-full" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={inputRef} // Assign ref to input
                    name={inputName}
                    type="text"
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2
                    focus:ring-primary-400 dark:focus:ring-primary-500 bg-primary-200 dark:bg-primary-700
                    border border-primary-700 dark:border-primary-600 sm:text-sm"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    onClick={handleInputFocus}
                    // onBlur={() => setIsOpen(false)}
                    autoComplete="off"
                />
                <ChevronDownIcon
                    onClick={handleInputFocus}
                    className={`absolute cursor-none right-2 top-1/2 transform
                        -translate-y-1/2 transition-transform ${isOpen ? "-rotate-180" : ""}`}
                />
            </div>

            {isOpen && (
                <div
                    className="absolute z-10 mt-1 w-full bg-primary-200 dark:bg-primary-700 shadow-lg max-h-60 rounded-lg py-1
                    text-base border border-primary-700 dark:border-primary-600 overflow-auto focus:outline-none sm:text-sm"
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9
                                text-gray-900 dark:text-gray-100
                                hover:bg-primary-300 dark:hover:bg-primary-600 ${
                                    selectedOption?.value === option.value
                                        ? "bg-primary-300 dark:bg-primary-600"
                                        : ""
                                }`}
                                onClick={() => handleOptionClick(option)}
                            >
                                <span
                                    className={`block truncate ${
                                        selectedOption?.value === option.value
                                            ? "font-semibold"
                                            : "font-normal"
                                    }`}
                                >
                                    {option.label}
                                </span>
                            </div>
                        ))
                    ) : searchTerm.trim() !== "" && onAddOption ? ( // Check searchTerm & onAddOption presence
                        <div className="cursor-default select-none relative py-2 px-3 text-gray-500 dark:text-gray-400">
                            Press Enter to add "{searchTerm.trim()}"
                        </div>
                    ) : (
                        // Standard "No options found" if search yielded nothing or is empty
                        <div className="cursor-default select-none relative py-2 px-3 text-gray-500 dark:text-gray-400">
                            No options found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SimpleDropdown;

export type { DropdownOption };
