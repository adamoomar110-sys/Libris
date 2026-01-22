import React from 'react';

const ResultCard = ({ result, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-slate-800 truncate" title={result.filename}>
                    {result.filename}
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    Page {result.page}
                </span>
            </div>
            <p className="text-sm text-slate-600 font-mono bg-slate-50 p-2 rounded border border-slate-100">
                {result.snippet}
            </p>
        </div>
    );
};

export default ResultCard;
