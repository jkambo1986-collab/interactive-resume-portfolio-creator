/**
 * @file WebSearch.tsx
 * This component provides an interface for users to perform AI-powered web searches.
 * It uses the Gemini API with Google Search grounding to fetch and display up-to-date information.
 * It manages its own state for the query, loading status, errors, and search results.
 */

import React, { useState, useCallback, memo } from 'react';
import { performWebSearch } from '../services/geminiService';
import type { SearchResult } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import LoadingSpinner from './LoadingSpinner';

const WebSearchComponent: React.FC = () => {
    // State for the component's UI
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

    /**
     * Handles the form submission to initiate a web search.
     */
    const handleSearch = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Reset state for the new search
        setIsLoading(true);
        setError(null);
        setSearchResult(null);

        try {
            const result = await performWebSearch(query);
            setSearchResult(result);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred during the search.");
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    return (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800">AI-Powered Web Research</h3>
            <p className="text-sm text-slate-600">
                Need to research a company, job role, or industry trend? Use grounded generation to get up-to-date information from the web to help you tailor your resume.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'Latest trends in frontend development 2024'"
                    className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                />
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? <LoadingSpinner /> : <SearchIcon />}
                </button>
            </form>

            {/* Display error message if the search fails */}
            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            
            {/* Display search results when available */}
            {searchResult && (
                <div className="pt-4 mt-4 border-t">
                    <h4 className="font-semibold text-slate-800">Search Results:</h4>
                    <div className="mt-2 p-4 bg-white rounded-md shadow-sm prose prose-sm max-w-none">
                        <p>{searchResult.summary}</p>
                    </div>

                    {searchResult.sources.length > 0 && (
                        <div className="mt-4">
                            <h5 className="font-semibold text-slate-700">Sources:</h5>
                            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                                {searchResult.sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default memo(WebSearchComponent);
