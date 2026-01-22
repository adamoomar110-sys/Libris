import React, { useState } from 'react';
import { Globe } from 'lucide-react';

const SearchBar = ({ onSearch, theme, searchMode, onModeChange }) => {
    const [query, setQuery] = useState('');

    // Fallback if theme not passed yet
    const t = theme || {
        input: 'bg-white border-slate-300',
        buttonPrimary: 'bg-blue-600 text-white',
        ringColor: 'ring-blue-500',
        text: 'text-gray-900'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 relative z-20">
            <form onSubmit={handleSubmit} className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchMode === 'web' ? "Busca libros en la web..." : "Busca en tu biblioteca..."}
                    className={`w-full pl-12 pr-28 py-4 text-lg rounded-full border shadow-lg focus:outline-none focus:ring-2 transition-all ${t.input} ${t.ringColor}`}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">
                    <Globe size={20} className={searchMode === 'web' ? 'text-indigo-500 opacity-100' : ''} />
                </div>
                <button
                    type="submit"
                    className={`absolute right-2 top-2 bottom-2 px-6 rounded-full font-medium transition-transform transform hover:scale-105 shadow-md ${t.buttonPrimary}`}
                >
                    Buscar
                </button>
            </form>

            <div className="flex items-center justify-center gap-4 mt-3">
                <label className="flex items-center cursor-pointer gap-2 group">
                    <span className={`text-xs font-bold uppercase tracking-widest transition-opacity ${searchMode === 'local' ? 'opacity-100' : 'opacity-40'}`}>Local</span>
                    <div className="relative" onClick={() => onModeChange(searchMode === 'local' ? 'web' : 'local')}>
                        <div className={`w-10 h-5 rounded-full transition-colors ${searchMode === 'web' ? 'bg-indigo-500' : 'bg-gray-400'}`}></div>
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${searchMode === 'web' ? 'translate-x-5' : ''}`}></div>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest transition-opacity ${searchMode === 'web' ? 'opacity-100' : 'opacity-40'}`}>Web</span>
                </label>
            </div>
        </div>
    );
};

export default SearchBar;
