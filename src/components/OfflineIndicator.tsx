import React from 'react';
import { WifiOff, RefreshCw, Clock } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  cachedAt?: number;
  isOfflineData?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  cachedAt,
  isOfflineData,
  onRefresh,
  isRefreshing = false,
}) => {
  const isOnline = useOnlineStatus();
  const showOfflineWarning = !isOnline || isOfflineData;

  if (!showOfflineWarning) return null;

  const timeAgoStr = cachedAt
    ? formatTimeAgo(cachedAt)
    : 'recently';

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-center justify-between gap-3 rounded-2xl bg-amber-950/95 border border-amber-500/50 p-3.5 shadow-2xl backdrop-blur-md text-amber-200 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex-shrink-0 p-2 rounded-xl bg-amber-500/20 text-amber-400">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="min-w-0 text-xs">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{!isOnline ? 'Offline Mode' : 'Cached Forecast Active'}</span>
          </div>
          <div className="text-[11px] text-amber-200/80 truncate flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>Cached {timeAgoStr}. All 5-day hourly data available offline.</span>
          </div>
        </div>
      </div>

      {onRefresh && (
        <button
          id="btn-retry-offline-sync"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          title="Attempt Reconnection"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden xs:inline">Retry</span>
        </button>
      )}
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes === 1) return '1 min ago';
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return '1 hr ago';
  if (diffHours < 24) return `${diffHours} hrs ago`;

  return 'earlier today';
}
