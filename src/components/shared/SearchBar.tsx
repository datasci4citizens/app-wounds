import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../ui/button.tsx';

/**
 * SearchBar component props
 * @interface SearchBarProps
 * @property {string} [placeholder] - Placeholder text for the search input
 * @property {function} [onChange] - Callback function for input change events
 * @property {string} [value] - Current value of the search input
 * @property {string} [className] - Additional CSS classes for the container
 * @property {function} [onAddClick] - Optional callback for the add button. If not provided, the button won't be rendered
 * @property {function} [onFilterClick] - Optional callback for the filter button. If not provided, the button won't be rendered
 * @property {string|number} [height] - Optional custom height for the search bar
 */
interface SearchBarProps {
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  className?: string;
  onAddClick?: () => void;
  onFilterClick?: () => void;
  height?: string | number;
}

/**
 * SearchBar component with optional add and filter buttons
 * 
 * A customizable search input component that displays a search icon on the left side
 * and optionally buttons on the right side (filter and/or add) if their callbacks are provided.
 * 
 * @param {SearchBarProps} props - Component props
 * @returns {JSX.Element} The rendered SearchBar component
 * 
 * @example
 * // Basic usage
 * <SearchBar placeholder="Search..." onChange={handleSearch} value={searchQuery} />
 * 
 * @example
 * // With add button
 * <SearchBar 
 *   placeholder="Search patients..." 
 *   onChange={handleSearch} 
 *   value={searchQuery} 
 *   onAddClick={handleAddNew}
 *   height="64px"
 * />
 * 
 * @example
 * // With filter button
 * <SearchBar 
 *   placeholder="Search patients..." 
 *   onChange={handleSearch} 
 *   value={searchQuery} 
 *   onFilterClick={handleShowFilters}
 * />
 * 
 * @example
 * // With both buttons
 * <SearchBar 
 *   placeholder="Search patients..." 
 *   onChange={handleSearch} 
 *   value={searchQuery} 
 *   onAddClick={handleAddNew}
 *   onFilterClick={handleShowFilters}
 * />
 */
export function SearchBar({ 
  placeholder = "", 
  onChange, 
  value, 
  className = "",
  onAddClick,
  onFilterClick,
  height
}: SearchBarProps) {
  
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Search icon positioned on the left side */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 z-10">
        <Search size={20} />
      </div>
      
      {/* Search input with dynamic padding based on whether buttons are present */}
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        className={`w-full rounded-[20px] bg-white py-2 pl-10 ${
          onAddClick && onFilterClick ? 'pr-24' : (onAddClick || onFilterClick ? 'pr-14' : 'pr-4')
        } text-sm border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
        aria-label="Search"
        style={height ? { height } : undefined}
      />
      
      {/* Container for buttons - only shown if at least one button is needed */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 flex gap-2">
        {/* Optional filter button */}
        {onFilterClick && (
          <Button 
            onClick={onFilterClick} 
            className="rounded-lg bg-[#fad5d2] hover:bg-[#f8c8c4] flex items-center justify-center p-0"
            style={{ height: '32px', width: '32px' }}
            aria-label="Filter"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="5" height="1.5" fill="#0120AC" />
              <rect x="9" y="4" width="5" height="1.5" fill="#0120AC" />
              <rect x="2" y="7.25" width="5" height="1.5" fill="#0120AC" />
              <rect x="9" y="7.25" width="5" height="1.5" fill="#0120AC" />
              <rect x="2" y="10.5" width="5" height="1.5" fill="#0120AC" />
              <rect x="9" y="10.5" width="5" height="1.5" fill="#0120AC" />
              <rect x="7.25" y="2.5" width="1.5" height="4" fill="#0120AC" />
              <rect x="7.25" y="9.5" width="1.5" height="4" fill="#0120AC" />
            </svg>
          </Button>
        )}
        
        {/* Optional add button */}
        {onAddClick && (
          <Button 
            onClick={onAddClick} 
            className="rounded-lg bg-[#fad5d2] hover:bg-[#f8c8c4] flex items-center justify-center p-0"
            style={{ height: '32px', width: '32px' }}
            aria-label="Add new"
          >
            <Plus className="h-4 w-4 text-[#0120AC]" />
          </Button>
        )}
      </div>
    </div>
  );
}
