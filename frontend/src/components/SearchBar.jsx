import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search in your library..."
                    className="w-full px-6 py-4 text-lg rounded-full border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                    Search
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
