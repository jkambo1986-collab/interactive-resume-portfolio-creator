/**
 * @file ThemeSelector.tsx
 * A component that allows the user to select a color theme for their resume.
 * It displays a set of color swatches that are selectable.
 */

import React, { memo } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ThemeSelectorProps {
  themes: string[];
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
}

// Maps theme names to corresponding Tailwind CSS background color classes.
const themeColors: { [key: string]: string } = {
  'Modern Blue': 'bg-sky-600',
  'Classic Gray': 'bg-slate-600',
  'Professional Teal': 'bg-teal-600',
};

const ThemeSelectorComponent: React.FC<ThemeSelectorProps> = ({ themes, selectedTheme, onSelectTheme }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">Color Theme</label>
      <div className="mt-2 flex items-center gap-4">
        {themes.map(theme => (
          <button
            key={theme}
            type="button"
            onClick={() => onSelectTheme(theme)}
            className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none group"
            aria-pressed={selectedTheme === theme}
          >
            <div
              className={`relative h-10 w-10 rounded-full ${themeColors[theme]} flex items-center justify-center ring-2 ring-offset-2 transition-all ${
                selectedTheme === theme ? 'ring-sky-500' : 'ring-transparent group-hover:ring-slate-300'
              }`}
            >
              {/* Show a checkmark on the selected theme */}
              {selectedTheme === theme && (
                <CheckCircleIcon className="h-6 w-6 text-white" />
              )}
            </div>
            <span className={`text-xs font-medium ${selectedTheme === theme ? 'text-sky-600' : 'text-slate-500'}`}>
              {theme.split(' ')[1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(ThemeSelectorComponent);
