import React, { useState } from 'react';
import { Clock, ChefHat, Wallet, Leaf, ShoppingCart, Youtube, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export function RecipeDetailView({ data }) {
    const [activeTab, setActiveTab] = useState('overview');

    if (!data) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-slide-up">

            {/* Header */}
            <div className="bg-gradient-to-r from-pucho-purple to-indigo-600 p-8 md:p-12 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold">{data.title}</h2>
                        <p className="text-indigo-100 leading-relaxed text-lg max-w-2xl">{data.summary}</p>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {data.tags && data.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium border border-white/10">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-full md:w-80 flex-shrink-0">
                        <a href={data.youtube_url} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-black/20 rounded-xl overflow-hidden border border-white/20 relative group cursor-pointer shadow-lg">
                            <img src={data.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 ml-1 fill-current" />
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-100 px-8 flex overflow-x-auto gap-8">
                {['overview', 'ingredients', 'instructions', 'equipment', 'nutrition', 'details'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "py-4 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap px-2",
                            activeTab === tab
                                ? "border-pucho-purple text-pucho-purple"
                                : "border-transparent text-slate-500 hover:text-pucho-dark"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-8 bg-slate-50/50 min-h-[400px]">
                {activeTab === 'overview' && <OverviewTab data={data} />}
                {activeTab === 'ingredients' && <IngredientsTab data={data} />}
                {activeTab === 'instructions' && <InstructionsTab data={data} />}
                {activeTab === 'equipment' && <EquipmentTab data={data} />}
                {activeTab === 'nutrition' && <NutritionTab data={data} />}
                {activeTab === 'details' && <DetailsTab data={data} />}
            </div>
        </div>
    );
}

// --- Sub-components ---

function OverviewTab({ data }) {
    return (
        <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Prep Time" value={data.prep_time} icon={Clock} />
                <StatCard label="Cook Time" value={data.cook_time} icon={ChefHat} />
                <StatCard label="Total Time" value={data.total_time} icon={Clock} />
                <StatCard label="Est. Cost" value={data.cost} icon={Wallet} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Chef's Tips */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 h-full">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-pucho-purple" /> Chef's Tips
                    </h3>
                    <ul className="space-y-3">
                        {data.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-pucho-purple rounded-full flex-shrink-0" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* YouTube Link */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 h-full flex flex-col justify-center items-center text-center">
                    <Youtube className="w-12 h-12 text-red-600 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Watch Original Video</h3>
                    <a href={data.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {data.youtube_url}
                    </a>
                </div>
            </div>
        </div>
    );
}

function IngredientsTab({ data }) {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-500" /> Ingredients
                </h3>
                <ul className="space-y-3">
                    {data.ingredients.map((item, i) => {
                        const displayText = typeof item === 'object'
                            ? `${item.quantity} ${item.unit} ${item.name}`
                            : item;
                        return (
                            <li key={i} className="flex items-center gap-3 pb-2 border-b border-slate-50 last:border-0 text-slate-600">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {displayText}
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" /> Shopping List
                </h3>
                <ul className="space-y-3">
                    {data.shopping_list.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 pb-2 border-b border-slate-50 last:border-0 text-slate-600">
                            <span className="w-4 h-4 border rounded flex-shrink-0" /> {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function InstructionsTab({ data }) {
    return (
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
            {data.instructions.map((step, i) => {
                const stepText = typeof step === 'object' ? step.description : step;
                const stepTitle = typeof step === 'object' ? step.title : `Step ${i + 1}`;

                return (
                    <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 border border-indigo-100">
                            {i + 1}
                        </div>
                        <div className="space-y-1 pt-1">
                            <h4 className="font-bold text-pucho-dark">{stepTitle}</h4>
                            <p className="text-slate-700 leading-relaxed">{stepText}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function EquipmentTab({ data }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Required Equipment</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.equipment.map((item, i) => {
                    const name = typeof item === 'object' ? item.item : item;
                    const link = typeof item === 'object' ? item.buy_link : null;
                    return (
                        <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-2">
                            <span className="font-medium text-slate-700">{name}</span>
                            {link && (
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-auto">
                                    Check Price &rarr;
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function NutritionTab({ data }) {
    return (
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Nutrition Facts (Per Serving)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(data.nutrition).map(([key, val]) => (
                    <div key={key} className="p-4 bg-slate-50 rounded-lg text-center">
                        <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">{key.replace('_', ' ')}</div>
                        <div className="text-xl font-bold text-pucho-dark">{val || '-'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DetailsTab({ data }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Recipe Details</h3>
            <ul className="space-y-4 text-slate-600">
                {Object.entries(data.details).map(([key, val]) => (
                    val && val.length > 0 && (
                        <li key={key} className="border-b border-slate-50 pb-3 last:border-0">
                            <strong className="block text-pucho-dark mb-1">{key}:</strong>
                            {Array.isArray(val) ? (
                                <ul className="list-disc list-inside space-y-1 mt-1 pl-1">
                                    {val.map((v, i) => <li key={i}>{v}</li>)}
                                </ul>
                            ) : (
                                <span className="leading-relaxed">{val}</span>
                            )}
                        </li>
                    )
                ))}
            </ul>
        </div>
    );
}

function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-pucho-dark">{value}</div>
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                {Icon && <Icon className="w-3 h-3" />} {label}
            </div>
        </div>
    );
}
