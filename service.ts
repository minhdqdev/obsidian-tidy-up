import { App, Notice } from 'obsidian';
import { PluginSettings } from 'settings';
import * as path from 'path';

export const tidyUp = async (app: App, settings: PluginSettings) => {
    let imageFiles = app.vault.getFiles().filter(file => {
        const ext = file.extension.toLowerCase();
        
        // Skip files in subfolders
        if (file.path.includes('/') || file.path.includes('\\')) {
            return false;
        }

        return settings.imageExtensions.includes(ext);
    });

    // get assets directory
    const assetsDirectory = settings.assetsDirectory.trim();
    if (!assetsDirectory) {
        console.warn('No assets directory specified. No images will be moved.');
        return;
    }

    // Ensure the assets directory exists
    const assetsDirExists = await app.vault.adapter.exists(assetsDirectory);
    if (!assetsDirExists) {
        await app.vault.createFolder(assetsDirectory);
    }
    
    // Move images to the assets directory
    let isSuccess = true;

    for (const file of imageFiles) {
        const newPath = path.join(assetsDirectory, file.name);
        try {
            await app.vault.rename(file, newPath);
        } catch (error) {
            console.error(`Failed to move ${file.path} to ${newPath}:`, error);
            new Notice(`Failed to move ${file.path} to ${newPath}. Check console for details.`);
            isSuccess = false;
        }
    }

    if (isSuccess) {
        new Notice('Tidy up completed!');
    }
}