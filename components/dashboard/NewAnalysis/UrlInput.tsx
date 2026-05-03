'use client';

import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { isValidAmazonUrl } from '@/utils/urlValidator';

interface UrlInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onRemove?: () => void;
    placeholder?: string;
    error?: string;
    showRemove?: boolean;
}

export function UrlInput({
    label,
    value,
    onChange,
    onRemove,
    placeholder = 'https://www.amazon.com/dp/...',
    error,
    showRemove = false,
}: UrlInputProps) {
    const isValid = value.trim() === '' || isValidAmazonUrl(value);

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                            : isValid && value.trim() !== ''
                                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50'
                                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                        }`}
                />
                {showRemove && (
                    <button
                        onClick={onRemove}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded transition-colors"
                        title="Remove"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                )}
                {error ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                ) : value.trim() !== '' && isValid ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                ) : null}
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}
