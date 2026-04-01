import React from 'react';
import { useBackendStatus } from '@/context/BackendStatusContext';

const BackendStatus = () => {
    const { status } = useBackendStatus();

    return (
        <div className="flex flex-col gap-2 text-left">
            <h4 className="font-semibold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest mb-1">
                Backend Status
            </h4>
            <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                    {status === 'online' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                        status === 'online' ? 'bg-emerald-500' : 
                        status === 'offline' ? 'bg-rose-500' : 
                        'bg-amber-400'
                    }`}></span>
                </div>
                <span className={`text-sm font-medium ${
                    status === 'online' ? 'text-emerald-500' : 
                    status === 'offline' ? 'text-rose-500' : 
                    'text-amber-400'
                }`}>
                    {status === 'online' ? 'Operational' : 
                     status === 'offline' ? 'Offline' : 
                     'Checking...'}
                </span>
            </div>
            {status === 'online' && (
                <p className="text-[10px] text-slate-500 mt-1">
                    Powered by Render Backend
                </p>
            )}
        </div>
    );
};

export default BackendStatus;
