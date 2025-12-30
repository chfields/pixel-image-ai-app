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