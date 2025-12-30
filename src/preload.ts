// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {    
    readFile: (filePath: string | undefined) => {
        return ipcRenderer.invoke('read-file', filePath);
    },
    selectDirectory: () => {
        return ipcRenderer.invoke('select-directory');
    }
});

contextBridge.exposeInMainWorld('imageAPI', {
    processImage: (imageData: string, width: number, height: number, cropX: number, cropY: number) => {
        return ipcRenderer.invoke('process-image', imageData, width, height, cropX, cropY);
    },
    toPixels: (imageData: string) => {
        return ipcRenderer.invoke('to-pixels', imageData);  
    }
});

contextBridge.exposeInMainWorld('aiAPI', {
    runPrompt: (prompt: string) => {
        return ipcRenderer.invoke('run-prompt', prompt);
    },
    onResponseImage: (callback: (imageData: any) => void) => {
        ipcRenderer.on('ai-response-image', (event, imageData) => {
            callback(imageData);
        });
    },
    onResponseCompleted: (callback: (data: { responseID: string }) => void) => {
        ipcRenderer.on('ai-response-completed', (event, data) => {
            callback(data);
        });
    },
    onReasoningSummaryDelta: (callback: (data: any) => void) => {
        ipcRenderer.on('ai-response-reasoning-summary-text-delta', (event, data) => {
            callback(data);
        });
    }
});