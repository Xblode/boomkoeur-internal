"use client";

import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Search } from 'lucide-react';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Rechercher...',
  className = '',
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full max-w-sm ${className}`}>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
          <Search size={16} />
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          fullWidth
          className="pl-9 pr-12 h-9 text-sm rounded-lg" // Plus petit, plus compact
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          <Button 
            type="submit" 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 p-0 rounded-md"
            aria-label="Rechercher"
          >
            →
          </Button>
        </div>
      </div>
    </form>
  );
};
