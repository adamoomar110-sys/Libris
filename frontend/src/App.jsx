import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import { themes } from './themeConfig';
import { Square, Cat, Dog, Leaf } from 'lucide-react';

function App() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    const [activeTab, setActiveTab] = useState('local'); // 'local' | 'web' | 'chat'
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [chatResponse, setChatResponse] = useState('');

    // Dynamic theme
    const [theme, setTheme] = useState('nature');
    const t = themes[theme] || themes.nature;

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
                setResults(data);
            } else if (activeTab === 'chat') {
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
                headers: { 'Content-Type': 'application/json' },
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
        <div className={`min-h-screen font-sans transition-colors duration-500 relative flex flex-col ${t.bg}`}>
            {/* Watermark / Background Image */}
            {t.backgroundImage && (
                t.bgRepeat ? (
                    <div className="fixed inset-0 z-0 opacity-10 pointer-events-none select-none"
                        style={{ backgroundImage: `url(${t.backgroundImage})`, backgroundRepeat: 'space', backgroundSize: '150px' }}
                    ></div>
                ) : (
                    <div className="fixed bottom-0 right-0 p-8 z-0 opacity-20 pointer-events-none select-none">
                        <img src={t.backgroundImage} alt="" className="w-48 h-auto object-contain drop-shadow-lg" />
                    </div>
                )
            )}

            <div className="relative z-10 max-w-4xl mx-auto w-full p-4 sm:p-8 flex-grow">
                <header className="mb-8 text-center pt-8 relative">
                    <div className="absolute top-0 right-0 flex gap-2">
                        {Object.values(themes).map(th => {
                            const IconComponent = { square: Square, cat: Cat, dog: Dog, leaf: Leaf }[th.icon] || Square;
                            return (
                                <button
                                    key={th.id}
                                    onClick={() => setTheme(th.id)}
                                    className={`p-2 rounded-full border transition-all ${theme === th.id ? 'scale-110 shadow-md ' + t.ringColor : 'opacity-70 hover:opacity-100'} ${th.id === 'default' ? 'bg-gray-800' : th.id === 'kitten' ? 'bg-pink-300' : th.id === 'puppy' ? 'bg-amber-300' : 'bg-emerald-300'}`}
                                    title={th.label}
                                >
                                    {th.customIcon ? (
                                        <img src={th.customIcon} alt={th.label} className="w-5 h-5 rounded-full object-cover" />
                                    ) : (
                                        <IconComponent size={16} className={th.id === 'default' ? 'text-white' : 'text-gray-800'} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <h1 className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r ${t.titleGradient} mb-2`}>
                        Libris
                    </h1>
                    <p className={`${t.text} opacity-80 font-medium`}>Tu compañero inteligente para PDFs</p>
                </header>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('local')}
                        className={`px-5 py-2 rounded-full font-medium transition-all transform hover:scale-105 ${activeTab === 'local' ? t.buttonPrimary : t.buttonSecondary}`}
                    >
                        Biblioteca Local
                    </button>
                    <button
                        onClick={() => setActiveTab('web')}
                        className={`px-5 py-2 rounded-full font-medium transition-all transform hover:scale-105 ${activeTab === 'web' ? t.buttonPrimary : t.buttonSecondary}`}
                    >
                        Búsqueda Web
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all transform hover:scale-105 ${activeTab === 'chat' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : t.buttonSecondary}`}
                    >
                        <span>✨ Preguntar a IA</span>
                    </button>
                </div>

                <div className={`backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5 ${t.card}`}>
                    {/* API Key Settings */}
                    {activeTab === 'chat' && (
                        <div className="mb-6 max-w-md mx-auto">
                            <input
                                type="password"
                                placeholder="Google Gemini API Key (Opcional si ya configurada)"
                                value={apiKey}
                                onChange={(e) => saveApiKey(e.target.value)}
                                className={`w-full px-4 py-2 text-sm rounded-lg outline-none ${t.input}`}
                            />
                        </div>
                    )}

                    <SearchBar onSearch={handleSearch} theme={t} />

                    {/* Scan Settings */}
                    {activeTab === 'local' && (
                        <div className={`mt-8 p-4 rounded-xl border ${t.header}`}>
                            <h2 className={`text-sm font-semibold mb-3 ${t.headerText}`}>Escanear Carpeta</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ruta de carpeta (ej: C:\Libros)"
                                    className={`flex-1 px-4 py-2 rounded-lg outline-none ${t.input}`}
                                    id="scanPath"
                                />
                                <button
                                    onClick={() => handleScan(document.getElementById('scanPath').value)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${t.buttonSecondary}`}
                                >
                                    Escanear
                                </button>
                            </div>
                            {scanStatus && <p className={`mt-2 text-sm ${t.highlight}`}>{scanStatus}</p>}
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="mt-8 space-y-4 pb-20">
                    {loading && (
                        <div className="text-center py-12">
                            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${t.text} border-current opacity-50`}></div>
                            <p className={`mt-4 ${t.text} opacity-70`}>Buscando...</p>
                        </div>
                    )}

                    {/* Chat Response */}
                    {!loading && activeTab === 'chat' && chatResponse && (
                        <div className={`p-6 rounded-xl shadow-lg border border-purple-500/30 bg-purple-900/20 backdrop-blur-sm`}>
                            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wide mb-2">Respuesta IA</h3>
                            <div className={`prose max-w-none whitespace-pre-wrap ${t.text}`}>
                                {chatResponse}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {!loading && activeTab !== 'chat' && (
                        results.map((result, index) => (
                            activeTab === 'web' ? (
                                <div key={index} className={`p-4 rounded-xl shadow-md border transition-all hover:scale-[1.01] ${t.card}`}>
                                    <h3 className={`text-lg font-bold truncate ${t.highlight}`}>
                                        <a href={result.url} target="_blank" rel="noopener noreferrer">{result.title}</a>
                                    </h3>
                                    <p className={`text-xs opacity-60 mb-2 ${t.text}`}>{result.url}</p>
                                    <p className={`text-sm opacity-90 ${t.text}`}>{result.snippet}</p>
                                </div>
                            ) : (
                                <div key={`${result.filename}-${result.page}-${index}`} className={`p-4 rounded-xl shadow-md border transition-all hover:scale-[1.01] ${t.card}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-md font-bold ${t.headerText}`}>{result.filename}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${t.buttonSecondary}`}>Pág {result.page}</span>
                                    </div>
                                    <p className={`text-sm italic opacity-80 ${t.text}`}>"...{result.snippet}..."</p>
                                </div>
                            )
                        ))
                    )}

                    {!loading && !chatResponse && results.length === 0 && (
                        <div className="text-center py-12 opacity-50">
                            <p className={t.text}>{activeTab === 'chat' ? 'Pregúntale a tus libros...' : 'Listo para buscar.'}</p>
                        </div>
                    )}
                </div>
            </div>

            <footer className={`w-full text-center p-8 mt-auto text-xs opacity-60 ${t.text} relative z-10`}>
                <p>Libris v1.0 &copy; {new Date().getFullYear()} Adamo. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;

