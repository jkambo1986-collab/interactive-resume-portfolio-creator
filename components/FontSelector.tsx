/**
 * @file FontSelector.tsx
 * A custom dropdown component for selecting a font family for the resume.
 * It manages its own open/closed state and handles clicks outside to close the dropdown.
 */

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';

interface FontSelectorProps {
  fonts: string[];
  selectedFont: string;
  onSelectFont: (font: string) => void;
}

const FontSelectorComponent: React.FC<FontSelectorProps> = ({ fonts, selectedFont, onSelectFont }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the dropdown to close it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Cleanup the event listener on component unmount.
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Handles the selection of a new font.
   */
  const handleSelect = useCallback((font: string) => {
    onSelectFont(font);
    setIsOpen(false); // Close the dropdown after selection.
  }, [onSelectFont]);

  return (
    <div>
        <label className="block text-sm font-medium text-slate-700">Font Family</label>
        <div className="relative mt-1" ref={dropdownRef}>
            <button
            type="button"
            className="relative w-full cursor-pointer rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            >
                <span className="block truncate" style={{ fontFamily: `'${selectedFont}', sans-serif` }}>
                    {selectedFont}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 7.03 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.78 9.53a.75.75 0 011.06 0L10 15.19l2.97-2.97a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>
            {isOpen && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm" role="listbox">
                    {fonts.map(font => (
                    <li
                        key={font}
                        className="text-gray-900 relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-sky-100"
                        onClick={() => handleSelect(font)}
                        role="option"
                        aria-selected={font === selectedFont}
                    >
                        <span className="block truncate" style={{ fontFamily: `'${font}', sans-serif` }}>
                            {font}
                        </span>
                    </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  );
};

export default memo(FontSelectorComponent);
