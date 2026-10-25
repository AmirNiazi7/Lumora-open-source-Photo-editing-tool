// Lumora Studio - Right Panels Sidebar
import React, { useState } from 'react';
import { Layer, HistoryItem } from '../types';
import { LayersPanel } from './LayersPanel';
import { HistoryPanel } from './HistoryPanel';
import { Layers, History, SlidersHorizontal } from 'lucide-react';

interface RightSidebarProps {
  layers: Layer[];
  activeLayerId: string | null;
  historyItems: HistoryItem[];
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onNewLayer: () => void;
  onDuplicateLayer: () => void;
  onDeleteLayer: () => void;
  onMoveLayerUp: () => void;
  onMoveLayerDown: () => void;
  onJumpToHistory: (index: number) => void;
  onOpenAdjustments: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  layers,
  activeLayerId,
  historyItems,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onUpdateLayer,
  onNewLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onJumpToHistory,
  onOpenAdjustments
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'history'>('layers');

  return (
    <div className="lumora-sidebar">
      {/* Panel Tab Headers */}
      <div className="sidebar-tab-headers">
        <button
          className={`sidebar-tab-button ${activeTab === 'layers' ? 'active' : ''}`}
          onClick={() => setActiveTab('layers')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <Layers size={13} />
            <span>Layers</span>
          </div>
        </button>
        <button
          className={`sidebar-tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <History size={13} />
            <span>History</span>
          </div>
        </button>
        <button
          className="sidebar-tab-button"
          title="Open Adjustments & Filters"
          onClick={onOpenAdjustments}
          style={{ flex: '0 0 36px' }}
        >
          <SlidersHorizontal size={13} />
        </button>
      </div>

      {/* Active Panel View */}
      {activeTab === 'layers' ? (
        <LayersPanel
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={onSelectLayer}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onUpdateLayer={onUpdateLayer}
          onNewLayer={onNewLayer}
          onDuplicateLayer={onDuplicateLayer}
          onDeleteLayer={onDeleteLayer}
          onMoveLayerUp={onMoveLayerUp}
          onMoveLayerDown={onMoveLayerDown}
        />
      ) : (
        <HistoryPanel historyItems={historyItems} onJumpToHistory={onJumpToHistory} />
      )}
    </div>
  );
};
