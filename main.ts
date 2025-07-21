import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PluginSettings {
	assetsDir: string;
	mySetting: string;
	imageExtensions: string[];
	shouldRemoveEmptyNotes: boolean;
	shouldRemoveUnlinkedImages: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
	assetsDir: '',
	mySetting: 'default',
	imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
	shouldRemoveEmptyNotes: false,
	shouldRemoveUnlinkedImages: false,
}

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('paintbrush', 'Tidy up', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
			id: 'tidy-up',
			name: 'Tidy up',
			callback: () => {
				// Your tidying up logic goes here
				const assetsDir = this.settings.assetsDir;
				const imageExtensions = this.settings.imageExtensions;

				if (!assetsDir) {
					new Notice('Please set the assets directory in the plugin settings.');
					return;
				}

				if (imageExtensions.length === 0) {
					new Notice('Please set at least one image extension in the plugin settings.');
					return;
				}

				// Example logic: Just show a notice for now
				new Notice(`Moved images to "${assetsDir}" with imageExtensions: ${imageExtensions.join(', ')}`);
			}
		})

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
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

		containerEl.createEl('h2', { text: 'Tidying up' });

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
			.setDesc('The relative path to the assets directory (e.g., "assets" or "images"). All images will be moved to this directory when tidying up.')
			.addText(text => text
				.setPlaceholder('Enter your path')
				.setValue(this.plugin.settings.assetsDir)
				.onChange(async (value) => {
					this.plugin.settings.assetsDir = value;
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
