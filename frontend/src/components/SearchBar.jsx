import React, { useState } from 'react';

const SearchBar = ({ onSearch, theme }) => {
    const [query, setQuery] = useState('');

    // Fallback if theme not passed yet (shouldn't happen with updated App.jsx)
    const t = theme || {
        input: 'bg-white border-slate-300',
        buttonPrimary: 'bg-blue-600 text-white',
        ringColor: 'ring-blue-500'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8 relative z-20">
            <div className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca en tu biblioteca..."
                    className={`w-full px-6 py-4 text-lg rounded-full border shadow-lg focus:outline-none focus:ring-2 transition-all ${t.input} ${t.ringColor}`}
                />
                <button
                    type="submit"
                    className={`absolute right-2 top-2 bottom-2 px-6 rounded-full font-medium transition-transform transform hover:scale-105 shadow-md ${t.buttonPrimary}`}
                >
                    Buscar
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
