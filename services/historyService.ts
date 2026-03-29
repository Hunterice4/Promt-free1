import { get, set, del, clear, keys } from 'idb-keyval';

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: string;
  input: string;
  result: any;
}

const HISTORY_KEY_PREFIX = 'history_';

export const saveHistoryItem = async (mode: string, input: string, result: any): Promise<void> => {
  try {
    const id = `${HISTORY_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const item: HistoryItem = {
      id,
      timestamp: Date.now(),
      mode,
      input,
      result,
    };
    await set(id, item);
  } catch (error) {
    console.error('Failed to save history item:', error);
  }
};

export const getHistoryItems = async (): Promise<HistoryItem[]> => {
  try {
    const allKeys = await keys();
    const historyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(HISTORY_KEY_PREFIX));
    
    const items: HistoryItem[] = [];
    for (const key of historyKeys) {
      const item = await get<HistoryItem>(key as string);
      if (item) {
        items.push(item);
      }
    }
    
    // Sort by timestamp descending (newest first)
    return items.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get history items:', error);
    return [];
  }
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  try {
    await del(id);
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
};

export const clearAllHistory = async (): Promise<void> => {
  try {
    const allKeys = await keys();
    const historyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(HISTORY_KEY_PREFIX));
    for (const key of historyKeys) {
      await del(key);
    }
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};
