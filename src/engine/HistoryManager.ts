// Lumora Studio - Undo/Redo & History Manager
import { DocumentProject, HistoryItem, Layer } from '../types';

export class HistoryManager {
  private undoStack: HistoryItem[] = [];
  private redoStack: HistoryItem[] = [];
  private maxItems: number = 30;

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  public getHistoryList(): HistoryItem[] {
    return [...this.undoStack];
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public recordState(doc: DocumentProject, actionName: string): void {
    // Clear redo stack on any new action
    this.redoStack = [];

    const snapshot = this.createSnapshot(doc);
    const historyItem: HistoryItem = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action: actionName,
      timestamp: Date.now(),
      documentSnapshot: snapshot
    };

    this.undoStack.push(historyItem);
    if (this.undoStack.length > this.maxItems) {
      this.undoStack.shift();
    }
  }

  public undo(currentDoc: DocumentProject): { restoredDoc: Partial<DocumentProject>; action: string } | null {
    if (this.undoStack.length === 0) return null;

    // Push current state to redo stack
    const currentSnapshot = this.createSnapshot(currentDoc);
    const lastItem = this.undoStack.pop()!;
    this.redoStack.push({
      id: 'hist_' + Date.now(),
      action: lastItem.action,
      timestamp: Date.now(),
      documentSnapshot: currentSnapshot
    });

    const restoredDoc = this.restoreFromSnapshot(lastItem.documentSnapshot);
    return { restoredDoc, action: lastItem.action };
  }

  public redo(currentDoc: DocumentProject): { restoredDoc: Partial<DocumentProject>; action: string } | null {
    if (this.redoStack.length === 0) return null;

    // Push current state to undo stack
    const currentSnapshot = this.createSnapshot(currentDoc);
    const nextItem = this.redoStack.pop()!;
    this.undoStack.push({
      id: 'hist_' + Date.now(),
      action: nextItem.action,
      timestamp: Date.now(),
      documentSnapshot: currentSnapshot
    });

    const restoredDoc = this.restoreFromSnapshot(nextItem.documentSnapshot);
    return { restoredDoc, action: nextItem.action };
  }

  public jumpToHistoryIndex(targetIndex: number, currentDoc: DocumentProject): Partial<DocumentProject> | null {
    if (targetIndex < 0 || targetIndex >= this.undoStack.length) return null;

    // Save current to redo
    const currentSnapshot = this.createSnapshot(currentDoc);
    this.redoStack.push({
      id: 'hist_' + Date.now(),
      action: 'Jump in History',
      timestamp: Date.now(),
      documentSnapshot: currentSnapshot
    });

    // Extract target item and slice undo stack
    const targetItem = this.undoStack[targetIndex];
    // Put intermediate items onto redoStack
    const discarded = this.undoStack.splice(targetIndex + 1);
    this.redoStack.push(...discarded.reverse());

    return this.restoreFromSnapshot(targetItem.documentSnapshot);
  }

  private createSnapshot(doc: DocumentProject) {
    return {
      width: doc.width,
      height: doc.height,
      activeLayerId: doc.activeLayerId,
      layers: doc.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        visible: layer.visible,
        locked: layer.locked,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        rotation: layer.rotation,
        scaleX: layer.scaleX,
        scaleY: layer.scaleY,
        dataUrl: layer.canvas.toDataURL('image/png'),
        textConfig: layer.textConfig ? { ...layer.textConfig } : undefined,
        shapeConfig: layer.shapeConfig ? { ...layer.shapeConfig } : undefined,
        adjustments: { ...layer.adjustments }
      }))
    };
  }

  private restoreFromSnapshot(snapshot: HistoryItem['documentSnapshot']): Partial<DocumentProject> {
    const newLayers: Layer[] = snapshot.layers.map((sLayer) => {
      const canvas = document.createElement('canvas');
      canvas.width = sLayer.width;
      canvas.height = sLayer.height;
      const ctx = canvas.getContext('2d');

      if (sLayer.dataUrl && ctx) {
        const img = new Image();
        img.src = sLayer.dataUrl;
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
      }

      return {
        id: sLayer.id,
        name: sLayer.name,
        type: sLayer.type,
        visible: sLayer.visible,
        locked: sLayer.locked,
        opacity: sLayer.opacity,
        blendMode: sLayer.blendMode,
        x: sLayer.x,
        y: sLayer.y,
        width: sLayer.width,
        height: sLayer.height,
        rotation: sLayer.rotation,
        scaleX: sLayer.scaleX,
        scaleY: sLayer.scaleY,
        canvas: canvas,
        textConfig: sLayer.textConfig ? { ...sLayer.textConfig } : undefined,
        shapeConfig: sLayer.shapeConfig ? { ...sLayer.shapeConfig } : undefined,
        adjustments: { ...sLayer.adjustments }
      };
    });

    return {
      width: snapshot.width,
      height: snapshot.height,
      layers: newLayers,
      activeLayerId: snapshot.activeLayerId
    };
  }
}
