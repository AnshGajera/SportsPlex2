import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  className = "",
  style = {} 
}) => {
  return (
    <div 
      className={`search-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '10px 16px',
        width: '100%',
        maxWidth: '320px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      <Search 
        size={16} 
        color="#94a3b8" 
        style={{ 
          marginRight: '10px', 
          flexShrink: 0 
        }} 
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: '#94a3b8',
          fontSize: '13px',
          width: '100%',
          fontWeight: '400',
          paddingLeft: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
        }}
      />
    </div>
  );
};

export default SearchBar;
