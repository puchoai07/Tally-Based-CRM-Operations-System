import React, { useState, useEffect } from 'react';
import { fetchTaxationData, extractSheetDate } from '../lib/sheetService';
import { useOutletContext } from 'react-router-dom';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FileCard = ({ label, url, index }) => {
    // Clean up label (e.g., "gst1" -> "GST 1")
    const formattedLabel = label.replace(/([A-Z])/g, ' $1').toUpperCase();

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer h-[240px] overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-pucho-purple group-hover:text-white transition-all duration-300 shadow-inner">
                <FileText className="w-10 h-10" />
            </div>

            <h3 className="relative z-10 text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">{formattedLabel}</h3>
            <p className="relative z-10 text-xs text-green-500 font-medium mb-4 flex items-center gap-1 opacity-80">
                <CheckCircle className="w-3 h-3" /> Ready for download
            </p>

            <span className="relative z-10 flex items-center gap-2 text-sm font-bold text-white bg-gray-900 px-6 py-2.5 rounded-xl group-hover:bg-blue-600 transition-colors duration-300 shadow-lg">
                <span>Download</span>
                <Download className="w-4 h-4" />
            </span>
        </motion.a>
    );
};

const TaxationCompliance = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchTaxationData();
                setData(result);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                if (sheetDate) setLastUpdated(sheetDate);

            } catch (error) {
                console.error("Failed to fetch taxation data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pucho-purple"></div>
            </div>
        );
    }

    return (
        <div className="font-inter max-w-[1600px] mx-auto pb-8">
            {/* Header: Overview Stats */}


            <h2 className="text-lg font-bold text-gray-900 mb-6 px-1">Compliance Filings</h2>

            {/* Grid Content */}
            {data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.flatMap((row, rowIndex) =>
                        Object.entries(row)
                            .filter(([key, value]) => {
                                // Filter for URL-like values and ignore internal keys
                                const valStr = String(value).trim();
                                const isUrl = valStr.toLowerCase().startsWith('http');
                                const isIgnored = key === 'id';
                                return isUrl && !isIgnored;
                            })
                            .map(([key, value], colIndex) => (
                                <FileCard key={`${rowIndex}-${colIndex}`} label={key} url={value} index={colIndex} />
                            ))
                    )}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed"
                >
                    <h3 className="text-gray-900 font-bold">No files found</h3>
                    <p className="text-gray-500 text-sm">Please check the spreadsheet.</p>
                </motion.div>
            )}
        </div>
    );
};

export default TaxationCompliance;
