import Store from "electron-store";
import { safeStorage } from "electron";
import log from '../main-logger';

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
                            log.error("Safe storage encryption is not available.");
                            this.isInitialized = false;
                        }
                    }, 3000);
                }
            };
            checkReady();
        });
    }

    public saveApiKey(service: string, apiKey: string): void {
        if (!this.isInitialized) {
            log.error("ApiKeyStorage not initialized. Cannot save API key with encryption. Will be available when app is signed.");
            this.store.set(`apiKeys.${service}`, apiKey);
            return;
        }
        log.info(`Saving API key for service: ${service}`);
        const encryptedKey = safeStorage.encryptString(apiKey);
        this.store.set(`apiKeys.${service}`, encryptedKey.toString("base64"));
    }

    public getApiKey(service: string): string | undefined {
        if (!this.isInitialized) {
            log.warn("ApiKeyStorage not initialized. Cannot get API key with encryption. Will be available when app is signed.");
            return this.store.get(`apiKeys.${service}`) as string | undefined;
        }
        const encryptedKeyBase64 = this.store.get(`apiKeys.${service}`) as string | undefined;
        if (!encryptedKeyBase64) {
            return undefined;
        }
        const encryptedKey = Buffer.from(encryptedKeyBase64, "base64");
        return safeStorage.decryptString(encryptedKey);
    }

    public deleteApiKey(service: string): void {
        log.info(`Deleting API key for service: ${service}`);
        this.store.delete(`apiKeys.${service}`);
    }

}