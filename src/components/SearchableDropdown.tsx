import React, { useEffect, useRef, useState } from "react";

interface SearchableDropdownProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (item: any) => void;
    items: any[];
    displayKey: string;
    placeholder?: string;
    className?: string;
    maxLength?: number;
    disabled?: boolean;
}

const SearchableDropdown = ({
    value,
    onChange,
    onSelect,
    items,
    displayKey,
    placeholder,
    className,
    maxLength = 200,
    disabled = false,
}: SearchableDropdownProps) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedIndex(-1);
    }, [items]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!items?.length) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < items.length - 1 ? prev + 1 : prev
                );
                setTimeout(() => {
                    const selectedElement =
                        dropdownRef.current?.children[selectedIndex + 1];
                    selectedElement?.scrollIntoView({ block: "nearest" });
                }, 0);
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                setTimeout(() => {
                    const selectedElement =
                        dropdownRef.current?.children[selectedIndex - 1];
                    selectedElement?.scrollIntoView({ block: "nearest" });
                }, 0);
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0) {
                    onSelect(items[selectedIndex]);
                    setShowDropdown(false);
                }
                break;
            case "Escape":
                setShowDropdown(false);
                break;
        }
    };

    return (
        <div className={`relative ${showDropdown ? "z-50" : ""}`}>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    setShowDropdown(true);
                }}
                onClick={() => {
                    setShowDropdown(true);
                }}
                maxLength={maxLength}
                placeholder={placeholder}
                className={className}
                autoComplete="off"
                disabled={disabled}
            />
            {showDropdown && items?.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`px-4 py-2 cursor-pointer ${
                                index === selectedIndex
                                    ? "bg-blue-100 dark:bg-blue-600"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                            onClick={() => {
                                onSelect(item);
                                setShowDropdown(false);
                            }}
                        >
                            {item[displayKey]}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
