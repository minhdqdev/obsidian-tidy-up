import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import MyPlugin from './main';
import { invalidPathCharacterPattern } from './service'; // Import the pattern for invalid path characters

interface PluginSettings {
    assetsDirectory: string;
    mySetting: string;
    imageExtensions: string[];
    imageNamePattern: string;
    shouldRemoveEmptyNotes: boolean;
    shouldRemoveUnlinkedImages: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
    assetsDirectory: '',
    mySetting: 'default',
    imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    imageNamePattern: '^Pasted image',
    shouldRemoveEmptyNotes: false,
    shouldRemoveUnlinkedImages: false,
}

class SettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'General' });


        let assetsDirectorySetting: Setting;
        let defaultStyle: string;

        assetsDirectorySetting = new Setting(containerEl)
            .setName('Assets Directory')
            .setDesc('Enter valid directory name. For nested directory, use this format: dirA/dirB. If no directory is entered, no images will be moved. All images will be moved to this directory when tidying up.')
            .addText(text => text
                .setPlaceholder('Enter your path')
                .setValue(this.plugin.settings.assetsDirectory)
                .onChange(async (value) => {
                    let inputEl = assetsDirectorySetting.settingEl.querySelector('input')!;

                    // check if value is a valid possible directory path
                    if (value.match(invalidPathCharacterPattern)) {
                        new Notice('Invalid directory path. Please enter a valid path.');
                        
                        defaultStyle = inputEl.style.boxShadow;
                        inputEl!.style.boxShadow = '0 0 0 2px red';
                        return;
                    }

                    inputEl.style.boxShadow = defaultStyle || '';

                    this.plugin.settings.assetsDirectory = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('Image Extensions')
            .setDesc('The file extensions to consider as images when tidying up.')
            .addText(text => text
                .setPlaceholder('Enter extensions (comma-separated)')
                .setValue(this.plugin.settings.imageExtensions.join(', ')) // No need for Array.from, it's already an array
                .onChange(async (value) => {
                    // Split the input by commas and trim whitespace, remove duplicates
                    const imageExtensions = Array.from(new Set(value.split(',').map(ext => ext.toLowerCase().trim()))); 
                    // Filter out empty strings
                    this.plugin.settings.imageExtensions = imageExtensions.filter(ext => ext.length > 0);
                    await this.plugin.saveSettings();
                }));


        new Setting(containerEl)
            .setName('Remove Empty Notes')
            .setDesc('Enable to remove empty notes when tidying up.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.shouldRemoveEmptyNotes)
                .onChange(async (value) => {
                    this.plugin.settings.shouldRemoveEmptyNotes = value;
                    await this.plugin.saveSettings();
                }));
        
        // Define imageNamePatternSetting here so it can be referenced
        let imageNamePatternSetting: Setting;

        new Setting(containerEl)
            .setName('Remove Unlinked Images')
            .setDesc('Enable to remove unlinked images when tidying up.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.shouldRemoveUnlinkedImages)
                .onChange(async (value) => {
                    this.plugin.settings.shouldRemoveUnlinkedImages = value;

                    // Disable/enable imageNamePatternSetting based on this toggle
                    if (value) {
                        imageNamePatternSetting.setDisabled(false);
                        imageNamePatternSetting.settingEl.style.opacity = '1';
                    } else {
                        imageNamePatternSetting.setDisabled(true);
                        imageNamePatternSetting.settingEl.style.opacity = '0.5';
                    }
                    await this.plugin.saveSettings();
                }));
        
        // --- Move imageNamePatternSetting definition here, right after 'Remove Unlinked Images' ---
        imageNamePatternSetting = new Setting(containerEl) // Assign to the already declared variable
            .setName('Image Name Pattern')
            .setDesc('Enter a regex pattern to match image names. For example, "^Pasted image" will match images with that name. Leave empty to match all images.')
            .addText(text => text
                .setPlaceholder('Enter your regex pattern')
                .setValue(this.plugin.settings.imageNamePattern)
                .onChange(async (value) => {
                    this.plugin.settings.imageNamePattern = value;
                    await this.plugin.saveSettings();
                }));
        
        // Initialize its state based on shouldRemoveUnlinkedImages when the tab is first displayed
        if (!this.plugin.settings.shouldRemoveUnlinkedImages) {
            imageNamePatternSetting.setDisabled(true);
            imageNamePatternSetting.settingEl.style.opacity = '0.5';
        }

        // --- End of moved section ---

        // containerEl.createEl('hr');
    }
}

export { DEFAULT_SETTINGS, SettingTab };
export type { PluginSettings };