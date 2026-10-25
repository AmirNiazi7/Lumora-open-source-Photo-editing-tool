// Lumora Studio - History Panel
import React from 'react';
import { HistoryItem } from '../types';
import { History, RotateCcw } from 'lucide-react';

interface HistoryPanelProps {
  historyItems: HistoryItem[];
  onJumpToHistory: (index: number) => void;
  onClearHistory?: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  historyItems,
  onJumpToHistory
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="history-list">
        {historyItems.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#777', fontSize: '11px' }}>
            No history actions yet.
          </div>
        ) : (
          historyItems.map((item, index) => {
            const isLatest = index === historyItems.length - 1;
            return (
              <div
                key={item.id}
                className={`history-item ${isLatest ? 'active' : ''}`}
                onClick={() => onJumpToHistory(index)}
                title={`Revert to ${item.action}`}
              >
                <RotateCcw size={11} style={{ opacity: isLatest ? 1 : 0.6 }} />
                <span>{item.action}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
