import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, User, Bot } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export function ChatInterface({ messages, onSendMessage, isLoading }) {
    const inputRef = useRef(null);
    const bottomRef = useRef(null);
    const [selectedImage, setSelectedImage] = React.useState(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const value = inputRef.current.value.trim();
        if (value) {
            onSendMessage(value);
            inputRef.current.value = '';
        }
    };

    const CollapsibleText = ({ text }) => {
        const [isExpanded, setIsExpanded] = React.useState(false);
        const limit = 300; // Character limit for collapse

        if (text.length <= limit) return <p className="whitespace-pre-wrap">{text}</p>;

        return (
            <div>
                <p className="whitespace-pre-wrap">
                    {isExpanded ? text : `${text.substring(0, limit)}...`}
                </p>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-pucho-purple font-medium text-xs mt-2 hover:underline"
                >
                    {isExpanded ? "Read Less" : "Read More"}
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full mx-auto bg-white shadow-xl shadow-pucho-purple/5 border border-slate-100 overflow-hidden relative">

            {/* Header / Banner inside Chat */}
            <div className="bg-gradient-to-r from-pucho-purple/5 to-white p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-pucho-purple">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold text-sm tracking-wide">PUCHO TALLY ASSISTANT</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 opacity-60">
                        <div className="w-16 h-16 bg-pucho-purple/10 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-pucho-purple" />
                        </div>
                        <p className="text-lg font-medium">Got a Tally query? Just PUCHO.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex gap-4 max-w-[85%]",
                            msg.isImage ? "md:max-w-lg" : "md:max-w-3xl", // Constrain desktop width, esp for images
                            msg.type === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        {/* Avatar */}
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm overflow-hidden",
                            msg.type === 'user' ? "bg-pucho-purple text-white" : "bg-white border border-slate-200 p-1"
                        )}>
                            {msg.type === 'user' ? <User className="w-4 h-4" /> : <img src="/favicon.png" alt="AI" className="w-full h-full object-contain" />}
                        </div>

                        {/* Bubble */}
                        <div className={cn(
                            "p-3 md:p-4 rounded-2xl shadow-sm text-sm leading-relaxed break-words",
                            msg.type === 'user'
                                ? "bg-pucho-purple text-white rounded-br-none"
                                : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                        )}>
                            {msg.isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-pucho-purple" />
                                    <span>Researching...</span>
                                </div>
                            ) : msg.isImage ? (
                                <div className="space-y-2 relative group">
                                    {msg.content && <p className="mb-2 font-medium">{msg.title}</p>}
                                    <div className="relative cursor-pointer" onClick={() => setSelectedImage(msg.content)}>
                                        <img
                                            src={msg.content}
                                            alt="Research Result"
                                            className="rounded-lg border border-slate-100 shadow-sm max-w-full md:max-h-[60vh] w-auto transition-transform hover:scale-[1.01]"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const link = document.createElement('a');
                                                link.href = msg.content;
                                                link.download = `research-result-${Date.now()}.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-white text-pucho-purple rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Download Image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ) : msg.isHtml ? (
                                <div
                                    className="prose prose-sm max-w-none text-slate-700 [&_a]:text-pucho-purple [&_a]:font-semibold [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-2 hover:[&_a]:text-pucho-purple/80 [&_a]:transition-colors"
                                    dangerouslySetInnerHTML={{ __html: msg.content }}
                                />
                            ) : (
                                <CollapsibleText text={msg.content} />
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] mr-auto">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm overflow-hidden p-1">
                            <img src="/favicon.png" alt="AI" className="w-full h-full object-contain" />
                        </div>
                        <div className="p-3 md:p-4 rounded-2xl rounded-bl-none bg-white border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="animate-pulse">Solving your Query...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 pb-8 bg-white border-t border-slate-100">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Enter your tally query..."
                        className="flex-1 py-3 px-4 md:px-5 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-pucho-purple/50 outline-none text-slate-700 placeholder:text-slate-400 transition-all font-medium text-base"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading}
                        className="rounded-full w-12 h-12 flex-shrink-0 shadow-lg shadow-pucho-purple/20"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl max-h-screen p-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full Screen"
                            className="w-auto h-auto max-h-[90vh] mx-auto rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={(e) => {
                                const link = document.createElement('a');
                                link.href = selectedImage;
                                link.download = `research-result-${Date.now()}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="absolute bottom-4 right-4 p-3 bg-white hover:bg-slate-100 text-pucho-purple rounded-full shadow-lg transition-colors"
                            title="Download Image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
