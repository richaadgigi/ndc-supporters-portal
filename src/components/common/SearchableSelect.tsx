'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Close } from '@carbon/icons-react';

interface SearchableSelectProps {
  id: string;
  value: string;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const SearchableSelect = ({
  id,
  value,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  disabled = false,
  onChange,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const pick = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="xui-pos-relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="xui-w-fluid-100 xui-d-flex xui-flex-ai-center xui-flex-jc-space-between xui-grid-gap-half xui-cursor-pointer"
        style={{
          background: disabled ? 'var(--neutral-100)' : '#FFFFFF',
          border: '1px solid var(--neutral-300)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '14px',
          color: value ? 'var(--neutral-900)' : 'var(--neutral-400)',
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} style={{ color: 'var(--neutral-500)', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          className="xui-pos-absolute xui-w-fluid-100 xui-bg-white"
          style={{
            top: 'calc(100% + 4px)', left: 0, zIndex: 50,
            border: '1px solid var(--neutral-200)', borderRadius: '8px',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.10)', overflow: 'hidden',
          }}
        >
          <div
            className="xui-d-flex xui-flex-ai-center xui-grid-gap-half xui-px-1"
            style={{ borderBottom: '1px solid var(--neutral-200)' }}
          >
            <Search size={16} style={{ color: 'var(--neutral-400)', flexShrink: 0 }} />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                border: 'none', outline: 'none', width: '100%',
                padding: '10px 0', fontSize: '14px', background: 'transparent',
              }}
            />
            {query && (
              <span className="xui-cursor-pointer xui-d-inline-flex" onClick={() => setQuery('')}>
                <Close size={16} style={{ color: 'var(--neutral-400)' }} />
              </span>
            )}
          </div>

          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p className="xui-font-sz-85 xui-text-center xui-py-1" style={{ color: 'var(--neutral-500)', margin: 0 }}>
                No match found
              </p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => pick(option)}
                  className="xui-w-fluid-100 xui-cursor-pointer xui-font-sz-85"
                  style={{
                    background: option === value ? 'var(--primary-50)' : 'transparent',
                    color: option === value ? 'var(--primary-700)' : 'var(--neutral-800)',
                    border: 'none',
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontWeight: option === value ? 600 : 400,
                  }}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
