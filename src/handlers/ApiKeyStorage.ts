import Store from "electron-store";
import { safeStorage } from "electron";

export class ApiKeyStorage {
    private store: Store;
    private isInitialized = false;

    constructor(store: Store) {
        this.store = store;
    }   

    public async initialize(): Promise<boolean> {
        return new Promise((resolve) => {
            // try and then wait 3 seconds to ensure safeStorage is ready
            const checkReady = () => {
                if (safeStorage.isEncryptionAvailable()) {
                    resolve(true);
                    this.isInitialized = true;
                } else {
                    setTimeout(() => {
                        if (safeStorage.isEncryptionAvailable()) {
                            resolve(true);
                            this.isInitialized = true;
                        } else {
                            resolve(false);
                            this.isInitialized = false;
                        }
                    }, 3000);
                }
            };
            checkReady();
        });
    }

    public saveApiKey(service: string, apiKey: string): void {
        if (!this.isInitialized) return;
        const encryptedKey = safeStorage.encryptString(apiKey);
        this.store.set(`apiKeys.${service}`, encryptedKey.toString("base64"));
    }

    public getApiKey(service: string): string | undefined {
        const encryptedKeyBase64 = this.store.get(`apiKeys.${service}`) as string | undefined;
        if (!encryptedKeyBase64) {
            return undefined;
        }
        const encryptedKey = Buffer.from(encryptedKeyBase64, "base64");
        return safeStorage.decryptString(encryptedKey);
    }

    public deleteApiKey(service: string): void {
        this.store.delete(`apiKeys.${service}`);
    }

}