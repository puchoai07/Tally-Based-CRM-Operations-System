import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PuchoLogo from '../../assets/icons/chat_icon_final.png';
import { X, Send, Paperclip, Sparkles } from 'lucide-react';

const SUGGESTED_PROMPTS = [
    "📊 Monthly Summary",
    "📉 Top Debtors",
    "📦 Low Stock",
    "📈 Revenue Trend"
];

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! 👋 I'm your Pucho AI assistant. I can analyse your Tally data instantly. Try asking me something!",
            sender: 'bot',
            isHtml: false
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async (e, overrideText = null) => {
        if (e) e.preventDefault();

        let textToSend = overrideText || inputValue;
        if (!textToSend.trim()) return;

        // Strip Emojis for Webhook compatibility
        textToSend = textToSend.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
        if (!textToSend.trim()) return; // Return if only emoji was sent

        // User message
        const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            // Use local proxy to bypass CORS - Updated to /sync endpoint
            const response = await fetch("https://studio.pucho.ai/api/v1/webhooks/Mz0pJK0upqChYdQf7HqHl/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: textToSend }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            // Handle various response formats, prioritizing 'data' field as requested
            let botResponseText = data.data || data.text || data.answer || data.message || data.output || JSON.stringify(data);

            // Access deeper string if needed (sometimes data.data is the string)
            if (typeof botResponseText === 'object') {
                botResponseText = JSON.stringify(botResponseText);
            }

            // Formatting Helper
            const formatResponse = (text) => {
                if (!text) return "";
                let formatted = text;

                // 1. Handle Bold (**text**)
                formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                // 2. Handle Numbered Lists joined by text (e.g. "end. 2. Next")
                // Adds a double break before " N. " if it follows non-digits
                formatted = formatted.replace(/([^\d])\s+(\d+\.)\s/g, '$1<br/><br/><strong>$2</strong> ');

                // 3. Handle Newlines
                formatted = formatted.replace(/\n/g, '<br />');

                return formatted;
            };

            const botMsg = {
                id: Date.now() + 1,
                text: formatResponse(botResponseText),
                sender: 'bot',
                isHtml: true // Flag to indicate this message may contain HTML
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "The requested data is too large. Please specify a particular date, product name, or a shorter period to get a more accurate analysis.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-[92px] right-4 md:right-6 md:bottom-24 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 w-[calc(100%-32px)] md:w-[380px] h-[calc(100vh-140px)] max-h-[600px] overflow-hidden flex flex-col origin-bottom-right"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pucho-purple to-purple-700 p-4 flex items-center justify-between text-white shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <img src="/chat_icon_custom.png" alt="Pucho" className="w-10 h-10 object-contain brightness-0 invert" />
                                <div>
                                    <h3 className="font-bold text-base">Pucho Assistant</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white scrollbar-hide">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-pucho-purple text-white rounded-br-none'
                                            : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.isHtml ? (
                                            <div
                                                className="prose prose-sm max-w-none prose-p:my-0 prose-a:text-blue-600 prose-strong:text-gray-900"
                                                dangerouslySetInnerHTML={{ __html: msg.text }}
                                            />
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>



                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Ask anything..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-pucho-purple/20 outline-none transition-all placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="p-2.5 bg-pucho-purple text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pucho-purple/90 transition-all hover:scale-105 active:scale-95 shadow-md shadow-purple-200"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-16 md:bottom-6 right-6 z-50 w-16 h-16 bg-white rounded-full shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center text-pucho-purple hover:shadow-purple-300 transition-all group ${isOpen ? 'hidden md:flex' : 'flex'}`}
            >

                {/* Ripple Effect */}
                <span className="absolute inset-0 rounded-full bg-purple-50 opacity-0 group-hover:animate-ping"></span>

                {isOpen ? (
                    <X className="w-7 h-7" />
                ) : (
                    <img src="/chat_icon_custom.png" alt="Chat" className="w-9 h-9 object-contain" />
                )}
            </motion.button>
        </>
    );
};

export default Chatbot;

