# Obsidian Tidy Up 

This plugin helps you organize your [Obsidian]((https://obsidian.md)) vault by tidying up files and folders based on your settings.

## Features
- Automatically move images in the vault folder to a specified assets directory.
- Trash image files that are not referenced in any notes.
- Trash empty folders.


## Installation
**Approach 1**: Install the plugin from the Obsidian community plugins directory.
1. Open Obsidian.
2. Go to Settings > Community plugins.
3. Search for "Obsidian Tidy Up".
4. Click "Install" and then "Enable".
5. Restart Obsidian if necessary.


**Approach 2**: Manual installation
1. Clone or download this repository.
2. Place the plugin folder in your Obsidian vault's `.obsidian/plugins` directory.
3. Open Obsidian.
4. Go to Settings > Community plugins.
5. Enable the "Obsidian Tidy Up" plugin.


## How to use
Use the ribbon icon ("paint brush" in the left sidebar) to trigger the tidying process.

Or you can also use the command palette (Cmd/Ctrl + P) and search for "Tidy up".


## Changelog
- **v0.1.0**: Initial release with basic functionality to tidy up images.
- **v0.2.0**: Added functionality to trash empty folders and images not referenced in notes.

## Known issues
- This plugin has only been tested on Obsidian v1.8.10 on macOS. It may not work on other versions or platforms.
- Folders containing hidden files (like `.env`) are considered empty folders and will be trashed.