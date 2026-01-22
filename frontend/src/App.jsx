import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';

function App() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    const [activeTab, setActiveTab] = useState('local'); // 'local' | 'web' | 'chat'
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [chatResponse, setChatResponse] = useState('');

    const saveApiKey = (key) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
    };

    const handleSearch = async (query) => {
        setLoading(true);
        setResults([]);
        setChatResponse('');

        try {
            if (activeTab === 'local') {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data);
            } else if (activeTab === 'web') {
                const response = await fetch(`/api/web-search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data); // Web results should match/adapt to ResultCard structure or we create a new one
            } else if (activeTab === 'chat') {
                // Send request even if apiKey is empty, backend might have a default env var
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, api_key: apiKey || null })
                });
                const data = await response.json();
                setChatResponse(data.response);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async (path) => {
        setScanStatus('Scanning...');
        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path }),
            });
            const data = await response.json();
            setScanStatus(data.message);
        } catch (error) {
            console.error('Scan failed:', error);
            setScanStatus('Scan failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Libris</h1>
                    <p className="text-slate-500">Your intelligent PDF companion</p>
                </header>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('local')}
                        className={`px-4 py-2 rounded-full font-medium transition-colors ${activeTab === 'local' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        Local Library
                    </button>
                    <button
                        onClick={() => setActiveTab('web')}
                        className={`px-4 py-2 rounded-full font-medium transition-colors ${activeTab === 'web' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        Web Search
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${activeTab === 'chat' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50'}`}
                    >
                        <span>✨ Ask AI</span>
                    </button>
                </div>

                {/* API Key Settings (Only visible in Chat mode if key missing, or always somewhere tiny? Let's put it in a details block for now) */}
                {activeTab === 'chat' && (
                    <div className="mb-6 max-w-md mx-auto">
                        <input
                            type="password"
                            placeholder="Enter Google Gemini API Key"
                            value={apiKey}
                            onChange={(e) => saveApiKey(e.target.value)}
                            className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <p className="text-xs text-center text-slate-400 mt-1">Key is saved in your browser.</p>
                    </div>
                )}

                <SearchBar onSearch={handleSearch} />

                {/* Scan Settings (Only in Local mode) */}
                {activeTab === 'local' && (
                    <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold mb-4">Library Settings</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter folder path to scan (e.g., C:\Books)"
                                className="flex-1 px-4 py-2 border rounded"
                                id="scanPath"

                            />
                            <button
                                onClick={() => handleScan(document.getElementById('scanPath').value)}
                                className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900"
                            >
                                Scan Library
                            </button>
                        </div>
                        {scanStatus && <p className="mt-2 text-sm text-slate-600">{scanStatus}</p>}
                    </div>
                )}

                {/* Content Area */}
                <div className="space-y-4 pb-20">
                    {loading && (
                        <div className="text-center py-12">
                            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${activeTab === 'chat' ? 'border-purple-600' : 'border-blue-600'}`}></div>
                        </div>
                    )}

                    {/* Chat Response */}
                    {!loading && activeTab === 'chat' && chatResponse && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-2">AI Response</h3>
                            <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                                {chatResponse}
                            </div>
                        </div>
                    )}

                    {/* Search Results (Local & Web) */}
                    {!loading && activeTab !== 'chat' && (
                        results.map((result, index) => (
                            activeTab === 'web' ? (
                                // Web Result Card (Inline simply for now)
                                <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold text-blue-600 truncate">
                                        <a href={result.url} target="_blank" rel="noopener noreferrer">{result.title}</a>
                                    </h3>
                                    <p className="text-xs text-green-700 mb-1">{result.url}</p>
                                    <p className="text-sm text-slate-600">{result.snippet}</p>
                                </div>
                            ) : (
                                // Local Result Card
                                <ResultCard
                                    key={`${result.filename}-${result.page}-${index}`}
                                    result={result}
                                    onClick={() => console.log('Clicked', result)}
                                />
                            )
                        ))
                    )}

                    {!loading && !chatResponse && results.length === 0 && (
                        <p className="text-center text-slate-400 py-12">
                            {activeTab === 'chat' ? 'Ask me anything about your books!' : 'Ready to search.'}
                        </p>
                    )}
                </div>
            </div>

            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 text-center text-slate-500 text-sm">
                <p>&copy; 2026 Adamo. Libris v1.0. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;
