# Obsidian Inline Translate Plugin

## Overview

The Obsidian Inline Translate Plugin is a handy tool for seamless translation within your Obsidian notes. It allows you to translate text on-the-fly, insert translations inline, and customize how translations are displayed.

## Features

- Translate individual lines or selected text
- Insert translations inline after each line of text
- Quick-translate selected text to clipboard
- Translate selected text and insert as a formatted block
- Customizable translation block formats (code block, quotation, or callout)
- Set preferred source languages and target language

## Installation

1. Open Obsidian and go to Settings > Community Plugins
2. Disable Safe Mode if necessary
3. Click "Browse" and search for "Translate in-line"
4. Install the plugin and enable it
5. Assign handy keyboard shortcuts

## Usage

### Commands

The plugin adds three main commands:

1. **Translate each line of text and add translation after the line**
   - Translates each line in the current selection (or current line if no selection)
   - Inserts the translation below each original line

2. **Quick-translate selected text into clipboard**
   - Translates the selected text
   - Displays the translation in a notice
   - Copies the translation to the clipboard

3. **Translate selection and insert translation**
   - Translates the selected text
   - Inserts the translation below the selection in the chosen block format

Access these commands through the Obsidian Command Palette (Ctrl/Cmd + P).

### Settings

Customize the plugin behavior in the settings tab:

- **Block Type**: Choose how translations are formatted (code block, quotation, or foldable callout)
- **Preferred Languages**: Set a comma-separated list of preferred source languages, keep empty to auto-detect
- **Target Language**: Set the default language to translate into

## Note

This plugin uses the Google Translate API. Please be aware of any usage limitations or terms associated with the service.

## Feedback and Support

If you encounter any issues or have suggestions for improvements, please open an issue on the GitHub repository.

Enjoy seamless translations in your Obsidian notes!