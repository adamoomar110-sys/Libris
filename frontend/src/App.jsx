import React, { useState, useEffect } from 'react';
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
    const [aiResponse, setAiResponse] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [library, setLibrary] = useState([]);
    const [showLibrary, setShowLibrary] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookSummary, setBookSummary] = useState(null);
    const [savedUrls, setSavedUrls] = useState(new Set());

    // Dynamic theme
    const [theme, setTheme] = useState('nature');
    const t = themes[theme] || themes.nature;

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            const response = await fetch('/api/library');
            const data = await response.json();
            setLibrary(data);
        } catch (error) {
            console.error('Failed to fetch library:', error);
        }
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            await response.json();
            fetchLibrary();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm('¿Eliminar este libro de la biblioteca?')) return;
        try {
            await fetch(`/api/delete/${docId}`, { method: 'DELETE' });
            fetchLibrary();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleSummarize = async (docId) => {
        setBookSummary('Generando resumen...');
        setIsAiProcessing(true);
        try {
            const response = await fetch(`/api/summarize/${docId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'Resumir', api_key: apiKey || null })
            });
            const data = await response.json();
            setBookSummary(data.summary);
        } catch (error) {
            setBookSummary('Error al generar resumen.');
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleTranslate = async (docId) => {
        setIsAiProcessing(true);
        try {
            await fetch(`/api/translate/${docId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'Traducir', api_key: apiKey || null })
            });
            alert('Traducción completada y guardada.');
            fetchLibrary();
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleSearch = async (query) => {
        setLoading(true);
        setResults([]);
        setChatResponse('');
        setAiResponse('');
        setIsAiProcessing(true);

        try {
            if (activeTab === 'local') {
                const response = await fetch('/api/intelligent-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, api_key: apiKey || null })
                });
                const data = await response.json();
                setResults(data.results || []);
                setAiResponse(data.ai_response || '');
            } else if (activeTab === 'web') {
                const response = await fetch('/api/intelligent-web-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, api_key: apiKey || null })
                });
                const data = await response.json();
                setResults(data.results || []);
                setAiResponse(data.ai_response || '');
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
            setIsAiProcessing(false);
        }
    };

    const handleSaveFromWeb = async (url, title) => {
        try {
            const response = await fetch('/api/save-from-web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, filename: title })
            });
            if (response.ok) {
                setSavedUrls(prev => new Set([...prev, url]));
                fetchLibrary();
            } else {
                alert('No se pudo guardar el archivo. Verifica el link.');
            }
        } catch (error) {
            console.error('Save failed:', error);
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
                    <SearchBar
                        onSearch={handleSearch}
                        theme={t}
                        searchMode={activeTab === 'chat' ? 'local' : activeTab}
                        onModeChange={(mode) => setActiveTab(mode)}
                    />

                    {activeTab === 'local' && (
                        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between border-t border-white/10 pt-6">
                            <div className="flex gap-4">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleUpload}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${t.buttonPrimary}`}
                                >
                                    {isUploading ? 'Subiendo...' : '＋ Añadir PDF'}
                                </label>

                                <button
                                    onClick={() => setShowLibrary(!showLibrary)}
                                    className={`px-4 py-2 rounded-lg transition-all ${t.buttonSecondary}`}
                                >
                                    {showLibrary ? 'Ocultar Biblioteca' : 'Ver Biblioteca'}
                                </button>
                            </div>

                            {activeTab === 'chat' && (
                                <input
                                    type="password"
                                    placeholder="API Key (Opcional)"
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        localStorage.setItem('gemini_api_key', e.target.value);
                                    }}
                                    className={`px-4 py-2 text-sm rounded-lg outline-none ${t.input}`}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Library Grid */}
                {activeTab === 'local' && showLibrary && library.length > 0 && (
                    <div className="mt-8">
                        <h2 className={`text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2 ${t.text}`}>
                            📚 Tu Biblioteca
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {library.map(book => (
                                <div
                                    key={book.doc_id}
                                    className={`group relative flex flex-col items-center p-4 rounded-3xl transition-all hover:scale-105 border ${t.card} aspect-[3/4] justify-between text-center overflow-hidden`}
                                >
                                    {/* Icon / Action Overlay */}
                                    <div className="relative w-full aspect-square flex items-center justify-center bg-black/20 rounded-2xl mb-3 overflow-hidden">
                                        <span className="text-3xl font-black opacity-20 group-hover:opacity-10 transition-opacity">PDF</span>

                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                            <button
                                                onClick={() => handleSummarize(book.doc_id)}
                                                className="w-full py-1.5 bg-indigo-500 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-400"
                                            >
                                                ✨ RESUMIR
                                            </button>
                                            <button
                                                onClick={() => handleTranslate(book.doc_id)}
                                                className="w-full py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-400"
                                            >
                                                🌐 TRADUCIR
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book.doc_id)}
                                                className="w-full py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-400"
                                            >
                                                🗑️ BORRAR
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <h3 className={`text-xs font-bold leading-tight truncate px-1 ${t.headerText}`}>
                                            {book.filename}
                                        </h3>
                                        <p className="text-[10px] opacity-40 mt-1 uppercase tracking-tighter">
                                            {book.total_pages} páginas
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary Modal/Box */}
                {!loading && bookSummary && (
                    <div className="mt-8 p-6 rounded-3xl border border-indigo-500/30 bg-indigo-900/10 backdrop-blur-xl relative">
                        <button
                            onClick={() => setBookSummary(null)}
                            className="absolute top-4 right-4 text-xs opacity-50 hover:opacity-100"
                        >
                            Cerrar [x]
                        </button>
                        <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Resumen del Documento
                        </h3>
                        <div className={`prose max-w-none text-sm leading-relaxed ${t.text}`}>
                            {bookSummary}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="mt-8 space-y-6 pb-20">
                    {loading && (
                        <div className="text-center py-12">
                            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${t.text} border-current opacity-50`}></div>
                            <p className={`mt-4 ${t.text} opacity-70`}>{isAiProcessing ? 'IA pensando y buscando...' : 'Buscando...'}</p>
                        </div>
                    )}

                    {/* AI Response Block (for Local/Web Search) */}
                    {!loading && aiResponse && (
                        <div className={`p-6 rounded-2xl shadow-lg border border-indigo-500/30 bg-indigo-900/10 backdrop-blur-md relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 p-2 opacity-20">✨</div>
                            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                                Resumen Inteligente
                            </h3>
                            <div className={`prose max-w-none whitespace-pre-wrap leading-relaxed ${t.text}`}>
                                {aiResponse}
                            </div>
                        </div>
                    )}

                    {/* Chat Response (Dedicated Chat Tab) */}
                    {!loading && activeTab === 'chat' && chatResponse && (
                        <div className={`p-6 rounded-2xl shadow-lg border border-purple-500/30 bg-purple-900/10 backdrop-blur-md`}>
                            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-3">Respuesta IA</h3>
                            <div className={`prose max-w-none whitespace-pre-wrap leading-relaxed ${t.text}`}>
                                {chatResponse}
                            </div>
                        </div>
                    )}

                    {/* Sources / Results */}
                    {!loading && results.length > 0 && (
                        <div className="space-y-4">
                            <h3 className={`text-xs font-bold uppercase tracking-wider opacity-50 ml-1 ${t.text}`}>
                                {activeTab === 'web' ? 'Resultados Web' : 'Documentos Encontrados'}
                            </h3>
                            {results.map((result, index) => (
                                activeTab === 'web' ? (
                                    <div key={index} className={`p-5 rounded-2xl shadow-md border transition-all hover:shadow-lg ${t.card} relative overflow-hidden`}>
                                        {result.is_pdf && (
                                            <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-tighter">
                                                PDF Detected
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] opacity-40 uppercase tracking-widest truncate max-w-[200px]">
                                                {(() => {
                                                    try { return new URL(result.url).hostname; }
                                                    catch (e) { return 'Enlace'; }
                                                })()}
                                            </span>
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 ${t.highlight} leading-tight`}>
                                            <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {result.title}
                                            </a>
                                        </h3>
                                        <p className={`text-xs opacity-50 mb-3 truncate font-mono ${t.text}`}>{result.url}</p>
                                        <p className={`text-sm opacity-90 leading-relaxed line-clamp-2 ${t.text}`}>
                                            {result.snippet}
                                        </p>

                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex gap-3">
                                                <a
                                                    href={result.url}
                                                    target="_blank"
                                                    className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300"
                                                >
                                                    Ver en Navegador ↗
                                                </a>
                                                {result.is_pdf && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                                        Contenido PDF ✓
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleSaveFromWeb(result.url, result.title)}
                                                disabled={savedUrls.has(result.url)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${savedUrls.has(result.url) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
                                            >
                                                {savedUrls.has(result.url) ? (
                                                    <>✓ GUARDADO</>
                                                ) : (
                                                    <>💾 GUARDAR</>
                                                )}
                                            </button>
                                        </div>
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
                            ))}
                        </div>
                    )}

                    {!loading && !chatResponse && !aiResponse && results.length === 0 && (
                        <div className="text-center py-12 opacity-50">
                            <p className={t.text}>{activeTab === 'chat' ? 'Pregúntale a tus libros...' : 'Escribe algo para realizar una búsqueda inteligente.'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-3 mb-6 relative z-10">
                <a
                    href="https://wa.me/5491100000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform hover:shadow-[#25D366]/50"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span>Consultas por WhatsApp</span>
                </a>
            </div>

            <footer className={`w-full text-center p-8 mt-auto text-xs opacity-60 ${t.text} relative z-10`}>
                <p>Libris v1.5 &copy; {new Date().getFullYear()} Adamo. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;

