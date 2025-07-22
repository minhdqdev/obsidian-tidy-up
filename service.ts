import { App, Notice, TFile, ListedFiles, TFolder } from 'obsidian';
import { PluginSettings } from 'settings';
import * as path from 'path';

const getRootImageFiles = (app: App, settings: PluginSettings) => {
    return app.vault.getFiles().filter(file => {
        const ext = file.extension.toLowerCase();
        // Check if the file is an image and is in the outermost directory
        return settings.imageExtensions.includes(ext) && !file.path.includes('/');
    });
}

const getOrCreateAssetsDirectory = async (app: App, settings: PluginSettings) => {
    const assetsDirectory = settings.assetsDirectory.trim();
    if (!assetsDirectory) {
        console.warn('No assets directory specified. No images will be moved.');
        return null;
    }

    // Ensure the assets directory exists
    const assetsDirExists = await app.vault.adapter.exists(assetsDirectory);
    if (!assetsDirExists) {
        await app.vault.createFolder(assetsDirectory);
    }

    return assetsDirectory;
}

const moveRootImageFiles = async (app: App, settings: PluginSettings) => {
    const assetsDirectory = await getOrCreateAssetsDirectory(app, settings);

    if (!assetsDirectory) {
        new Notice('Assets directory is not specified. No images will be moved.');
        return true;
    }

    let isSuccess = true;

    let imageFiles = getRootImageFiles(app, settings);

    for (const file of imageFiles) {
        const newPath = path.join(assetsDirectory, file.name);

        // Check if the file already exists in the target directory
        if (await app.vault.adapter.exists(newPath)) {
            console.warn(`File ${newPath} already exists. Skipping.`);
            continue;
        }

        try {
            await app.vault.rename(file, newPath);
        } catch (error) {
            console.error(`Failed to move ${file.path} to ${newPath}:`, error);
            new Notice(`Failed to move ${file.path} to ${newPath}. Check console for details.`);
            isSuccess = false;
        }
    }

    return isSuccess;
}

const getLinkedImageFilesSet = (app: App, settings: PluginSettings) => {
    let s = new Set<string>();

    let extSet = new Set(settings.imageExtensions);

    let keys = Object.keys(app.metadataCache.resolvedLinks).filter(key => key.endsWith('.md'));

    keys.forEach(key => {
        let files = Object.keys(app.metadataCache.resolvedLinks[key]);
        files.forEach(file => {
            // get extension of the file
            const extPart = file.split('.').pop();
            if (!extPart) return;
            let ext = extPart.toLowerCase();

            if (extSet.has(ext)) {
                s.add(file);
            }
        });
    });

    return s;
}

const getUnlinkedImageFiles = (app: App, settings: PluginSettings) => {
    let s = getLinkedImageFilesSet(app, settings);

    return app.vault.getFiles().filter(file => {
        // Check if the file is not referenced in any note
        let unLinked = !s.has(file.path);
        // Check if the file is an image
        const ext = file.extension.toLowerCase();

        unLinked = unLinked && settings.imageExtensions.includes(ext)

        // Check if the file matches the regex image pattern settings.imageNamePattern
        if (settings.imageNamePattern) {
            const imageNamePattern = settings.imageNamePattern.toLowerCase();
            unLinked = unLinked && (file.name.toLowerCase().match(imageNamePattern) !== null);
        }

        return unLinked;
    });
}

const trashUnlinkedImageFiles = async (app: App, settings: PluginSettings) => {
    console.log('Trashing unlinked image files...');

    const unlinkedImages = getUnlinkedImageFiles(app, settings);

    // write unlinked images path to text file for debugging
    if (unlinkedImages.length === 0) {
        console.log('No unlinked images found.');
        new Notice('No unlinked images found.');
        return true;
    }

    
    const filePath = path.join(app.vault.getRoot().path, 'unlinked_images.md');

    if (filePath !== null) {
        // overwrite the file if it exists
        if (await app.vault.adapter.exists(filePath)) {
            const abstractFile = app.vault.getAbstractFileByPath(filePath);
            if (abstractFile && abstractFile instanceof TFile) {
                await app.vault.modify(abstractFile, '');
            }
        }

        else {
            await app.vault.create(filePath, unlinkedImages.map(file => file.path).join('\n'));
        }
        
    }

    for (const file of unlinkedImages) {
        try {
            // await app.vault.delete(file);
            await app.vault.trash(file, true); // Use trash instead of delete for safety
        } catch (error) {
            console.error(`Failed to trash ${file.path}:`, error);
            new Notice(`Failed to trash ${file.path}. Check console for details.`);
            return false;
        }
    }
    return true;
}

const trashEmptyDirectories = async (app: App, settings: PluginSettings) => {
    console.log('Trashing empty directories...');

    const directories = app.vault.getAllLoadedFiles().filter(file => file instanceof TFolder && file.children.length === 0);

    let isSuccess = true;

    for (const dir of directories) {
        try {
            await app.vault.trash(dir, true);
        } catch (error) {
            console.error(`Failed to trash empty directory ${dir.path}:`, error);
            new Notice(`Failed to trash empty directory ${dir.path}. Check console for details.`);
            isSuccess = false;
        }
    }

    return isSuccess;
}

export const tidyUp = async (app: App, settings: PluginSettings) => {
    let isSuccess = true;

    isSuccess = await moveRootImageFiles(app, settings);
    if (settings.shouldRemoveEmptyNotes) {
        isSuccess = isSuccess && await trashEmptyDirectories(app, settings);
    }
    if (settings.shouldRemoveUnlinkedImages) {
        isSuccess = isSuccess && await trashUnlinkedImageFiles(app, settings);
    }
    if (isSuccess) {
        new Notice('Tidy up completed!');
    }
}

export const invalidPathCharacterPattern = /\?/; // Invalid characters for file paths