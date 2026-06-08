"use client";

import { useState, useEffect, useRef } from "react";
import { getAuthHeaders } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Comorbidity {
  concept_id: string;
  code: string | null;
  name: string;
}

interface AsyncComorbiditySearchProps {
  selectedUris: string[];
  onChange: (uris: string[]) => void;
  initialItems?: Comorbidity[];
}

export function AsyncComorbiditySearch({ selectedUris, onChange, initialItems = [] }: AsyncComorbiditySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Comorbidity[]>([]);
  const [selectedItems, setSelectedItems] = useState<Comorbidity[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialItems.length > 0 && selectedItems.length === 0) {
      setSelectedItems(initialItems);
    }
  }, [initialItems, selectedItems.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/comorbidities/search/?search=${encodeURIComponent(query)}&limit=10`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: Comorbidity) => {
    if (!selectedItems.some(i => i.concept_id === item.concept_id)) {
      const newItems = [...selectedItems, item];
      setSelectedItems(newItems);
      onChange(newItems.map(i => i.concept_id));
    }
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (conceptId: string) => {
    const newItems = selectedItems.filter(i => i.concept_id !== conceptId);
    setSelectedItems(newItems);
    onChange(newItems.map(i => i.concept_id));
  };

  return (
    <div ref={wrapperRef} className="relative w-full space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedItems.map((item) => (
          <span key={item.concept_id} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
            {item.code ? `[${item.code}] ` : ""}{item.name}
            <button
              type="button"
              onClick={() => handleRemove(item.concept_id)}
              className="ml-1 hover:text-destructive focus:outline-none"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        placeholder="Buscar comorbidade por código ou nome..."
        className="flex h-14 w-full rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm disabled:opacity-50"
      />
      {isLoading && <div className="absolute top-14 left-0 w-full p-2 text-sm text-muted-foreground">Buscando...</div>}
      
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-card border border-border rounded-xl shadow-lg">
          {results.map((item) => (
            <li
              key={item.concept_id}
              onClick={() => handleSelect(item)}
              className="cursor-pointer px-4 py-2 hover:bg-muted/50 text-sm"
            >
              {item.code ? <span className="font-semibold mr-2 text-primary">[{item.code}]</span> : null}
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
