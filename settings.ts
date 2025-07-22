import { App, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from './main';

interface PluginSettings {
    assetsDirectory: string;
    mySetting: string;
    imageExtensions: string[];
    shouldRemoveEmptyNotes: boolean;
    shouldRemoveUnlinkedImages: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
    assetsDirectory: '',
    mySetting: 'default',
    imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
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

		// new Setting(containerEl)
		// 	.setName('Setting #1')
		// 	.setDesc('It\'s a secret')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter your secret')
		// 		.setValue(this.plugin.settings.mySetting)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.mySetting = value;
		// 			await this.plugin.saveSettings();
		// 		}));

		containerEl.createEl('h2', { text: 'General' });

		new Setting(containerEl)
			.setName('Remove Empty Notes')
			.setDesc('Enable to remove empty notes when tidying up.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.shouldRemoveEmptyNotes)
				.onChange(async (value) => {
					this.plugin.settings.shouldRemoveEmptyNotes = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Remove Unlinked Images')
			.setDesc('Enable to remove unlinked images when tidying up.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.shouldRemoveUnlinkedImages)
				.onChange(async (value) => {
					this.plugin.settings.shouldRemoveUnlinkedImages = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Assets Directory')
			.setDesc('Enter valid directory name. For nested directory, use this format: dirA/dirB. If no directory is entered, no images will be moved. All images will be moved to this directory when tidying up.')
			.addText(text => text
				.setPlaceholder('Enter your path')
				.setValue(this.plugin.settings.assetsDirectory)
				.onChange(async (value) => {
					this.plugin.settings.assetsDirectory = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('imageExtensions')
			.setDesc('The file imageExtensions to consider as images when tidying up.')
			.addText(text => text
				.setPlaceholder('Enter imageExtensions (comma-separated)')
        .setValue(this.plugin.settings.imageExtensions.join(', '))
        .onChange(async (value) => {
          // Split the input by commas and trim whitespace
          const imageExtensions = value.split(',').map(ext => ext.trim());
          // Filter out empty strings
          this.plugin.settings.imageExtensions = imageExtensions.filter(ext => ext.length > 0);
          await this.plugin.saveSettings();
				}));

		containerEl.createEl('hr');
    
    // // Add header
    // containerEl.createEl('h2', { text: 'Image Tidying' });
    // // Add horizontal rule
    // containerEl.createEl('hr');
	}
}

export { DEFAULT_SETTINGS, SettingTab };
export type { PluginSettings };
