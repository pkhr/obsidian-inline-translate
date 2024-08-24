import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import translate from 'translate-google';

// Define the structure for the plugin settings
interface InlineTranslateSettings {
    blockType: 'codeblock' | 'quotation' | 'callout'; // Type of block to use for translations
    preferredLanguages: string[]; // List of preferred source languages
    targetLanguage: string; // Target language for translations
}

// Default settings for the plugin
const DEFAULT_SETTINGS: InlineTranslateSettings = {
    blockType: 'codeblock', // Default block type is code block
    preferredLanguages: [], // No preferred languages by default
    targetLanguage: 'en' // Default target language is English
}

export default class InlineTranslatePlugin extends Plugin {
    settings: InlineTranslateSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new InlineTranslateSettingTab(this.app, this));

        // Command to translate lines and add blocks
        this.addCommand({
            id: 'inline-translate-line',
            name: 'Translate each linen of text and add translation after the line.',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const selection = editor.getSelection();
                let startLine, endLine;

                // Determine the range of lines to translate
                if (selection) {
                    startLine = editor.getCursor('from').line;
                    endLine = editor.getCursor('to').line;
                } else {
                    startLine = endLine = editor.getCursor().line;
                }

                // Translate each line in the range
                for (let i = startLine; i <= endLine; i++) {
                    const line = editor.getLine(i);
					if  (!/^\s*$/.test(line)) {
						const translatedText = await this.translateText(line);
						const formattedTranslation = this.formatTranslation(translatedText);
						editor.replaceRange(`${line}\n${formattedTranslation}\n`, { line: i, ch: 0 }, { line: i, ch: line.length });
						i += this.getLinesAdded()+1; // Skip the lines we just added
						endLine += this.getLinesAdded()+1; // Adjust the end line as we've added more lines
					}
                }
            }
        });

        // Command to translate selected text and show in Notice
        this.addCommand({
            id: 'translate-to-notice',
            name: 'Quick-translate selected text into clipboard.',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const selection = editor.getSelection();
                if (selection) {
                    const translatedText = await this.translateText(selection);
                    new Notice(await translatedText);
					await navigator.clipboard.writeText(translatedText);
                } else {
                    new Notice('No text selected for translation.');
                }
            }
        });

        // Command to translate selected text and insert in block
        this.addCommand({
            id: 'translate-to-block',
            name: 'Translate selection and insert translation.',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const selection = editor.getSelection();
                if (selection) {
                    const translatedText = await this.translateText(selection);
                    const formattedTranslation = this.formatTranslation(translatedText);
                    editor.replaceSelection(`${selection}\n${formattedTranslation}`);
                } else {
                    new Notice('No text selected for translation.');
                }
            }
        });
    }

    // Function to translate text using the Google Translate API
    async translateText(text: string): Promise<string> {
        try {
            const translatedText = await translate(text, { 
                to: this.settings.targetLanguage, // Use the target language from settings
                from: this.settings.preferredLanguages.length > 0 ? this.settings.preferredLanguages[0] : 'auto' // Use the first preferred language if available, otherwise auto-detect
            });
            return translatedText;
        } catch (error) {
            console.error('Error translating text:', error);
            new Notice('Error translating text. Please try again later.');
            return text; // Return original text if translation fails
        }
    }

    // Function to format the translated text based on the selected block type
    formatTranslation(text: string): string {
        switch (this.settings.blockType) {
            case 'codeblock':
                return `\`\`\`\n${text}\n\`\`\``; // Format as code block
            case 'quotation':
                return text.split('\n').map(line => `> ${line}`).join('\n'); // Format as quotation
            case 'callout':
                return `> [!translation]- ...\n${text.split('\n').map(line => `> ${line}`).join('\n')}`; // Format as info block
            default:
                return text; // Return unformatted text if no block type is selected
        }
    }

    // Function to determine the number of lines added based on the block type
    getLinesAdded(): number {
        switch (this.settings.blockType) {
            case 'codeblock':
                return 3; // Code block adds 3 lines (opening, content, closing)
            case 'quotation':
                return 1; // Quotation adds 1 line per original line
            case 'callout':
                return 2; // Info block adds 2 lines (info tag and content)
            default:
                return 1; // Default to 1 line added
        }
    }

    // Load settings from storage
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    // Save settings to storage
    async saveSettings() {
        await this.saveData(this.settings);
    }
}

// Settings tab for the plugin
class InlineTranslateSettingTab extends PluginSettingTab {
    plugin: InlineTranslatePlugin;

    constructor(app: App, plugin: InlineTranslatePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    // Display the settings tab
    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        // Setting for block type
        new Setting(containerEl)
            .setName('Block Type')
            .setDesc('Choose the block type for translations')
            .addDropdown(dropdown => dropdown
                .addOption('codeblock', 'Code Block')
                .addOption('quotation', 'Quotation')
                .addOption('callout', 'Callout')
                .setValue(this.plugin.settings.blockType)
                .onChange(async (value) => {
                    this.plugin.settings.blockType = value as 'codeblock' | 'quotation' | 'callout';
                    await this.plugin.saveSettings();
                }));

        // Setting for preferred languages
        new Setting(containerEl)
            .setName('Preferred Languages')
            .setDesc('Comma-separated list of preferred source languages (e.g., fr,es,de)')
            .addText(text => text
                .setPlaceholder('fr,es,de')
                .setValue(this.plugin.settings.preferredLanguages.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.preferredLanguages = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                    await this.plugin.saveSettings();
                }));

        // Setting for target language
        new Setting(containerEl)
            .setName('Target Language')
            .setDesc('The language to translate to (e.g., en for English)')
            .addText(text => text
                .setPlaceholder('en')
                .setValue(this.plugin.settings.targetLanguage)
                .onChange(async (value) => {
                    this.plugin.settings.targetLanguage = value.trim() || 'en';
                    await this.plugin.saveSettings();
                }));
    }
}
