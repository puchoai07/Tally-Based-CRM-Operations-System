import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Play, X, Image as ImageIcon, Loader2 } from 'lucide-react';
// import { CookingLoader } from '../components/ui/CookingLoader'; // Removed as per user request
import { mapSheetRowToResearch } from '../lib/deepDiveUtils';

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1sJ2pjmQHzji3cTkqOB19SQYzdmAoteh9FetkWntQnwc/gviz/tq?tqx=out:csv";

export function ResearchHistory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(SHEET_CSV_URL);
                const csvText = await res.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const parsedItems = results.data
                            .filter(row => row['Topic']) // Filter valid rows by Topic
                            .map(row => mapSheetRowToResearch(row));

                        setItems(parsedItems.reverse()); // Show newest first
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error("Failed to load history", error);
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredItems = items.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-pucho-purple mb-4" />
                <p className="text-slate-500 font-medium">Loading history...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Research History</h1>
                    <p className="text-slate-500">Explore your collection of deep dives.</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pucho-purple/20 focus:border-pucho-purple outline-none transition-all shadow-sm text-base"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedItem(item)}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col h-full"
                    >
                        {/* Thumbnail */}
                        <div className="aspect-video relative overflow-hidden bg-slate-100">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-slate-300">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}

                            {/* Overlay removed as per user request */}
                        </div>

                        {/* Info */}
                        <div className="p-5 flex-1">
                            <h3 className="font-bold text-lg text-pucho-dark line-clamp-1 mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{item.summary}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedItem(null)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-fade-in p-6">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-pucho-dark">{selectedItem.title}</h2>
                            {selectedItem.imageUrl && (
                                <div className="flex justify-center w-full">
                                    <div className="relative group">
                                        <img
                                            src={selectedItem.imageUrl}
                                            alt={selectedItem.title}
                                            className="w-auto max-h-[75vh] object-contain rounded-xl shadow-md"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const link = document.createElement('a');
                                                link.href = selectedItem.imageUrl;
                                                link.download = `research-result-${selectedItem.id || Date.now()}.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="absolute bottom-4 right-4 p-3 bg-white/90 hover:bg-white text-pucho-purple rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Download Image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                            <p className="text-slate-600 leading-relaxed text-lg">{selectedItem.summary}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
