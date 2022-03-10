import { Emoji } from 'Emoji';
import { App, debounce, Editor, FileSystemAdapter, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface VarConfig {
	vaultPath: "*" | string;
	name: string;
	value: string;
}

interface VariablesPluginSettings {
	variables: VarConfig[];
	filter: string;
}

const DEFAULT_SETTINGS: VariablesPluginSettings = {
	variables: [{
		vaultPath: "*",
		name: "demo",
		value: "swapped"
	}],
	filter: ""
}

export default class VariablesPlugin extends Plugin {
	settings: VariablesPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) => {
			console.log(element.innerHTML.replace("$(MEDIA)", "/home/jffaust/"));
			element.innerHTML = element.innerHTML.replace("$(MEDIA)", "home/jffaust/Pictures");

		});

		this.addSettingTab(new SampleSettingTab(this.app, this));
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

function getVaultAbsolutePath(app: App) {
	let adapter = app.vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		return adapter.getBasePath();
	}
	return null;
}

class SampleSettingTab extends PluginSettingTab {
	plugin: VariablesPlugin;
	debouncedRefresh = debounce(this.display, 700, true);

	constructor(app: App, plugin: VariablesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		console.log(`Vault abs path: ${getVaultAbsolutePath(this.app)}`);

		new Setting(containerEl)
			.setClass("plugin-vars-header")
			.setName(`Variables`)
			.addText(text => text
				.setPlaceholder('Filter by variable name')
				.setValue(this.plugin.settings.filter)
				.onChange(async (value) => {
					this.plugin.settings.filter = value;
					console.log('Filter updated:' + value);
					await this.plugin.saveSettings();
					console.log('Settings saved');
					this.debouncedRefresh();
					console.log('debounced refresh');
				}))
			.addButton(btn => btn
				.setTooltip("Copy current vault path")
				.setIcon("vault")
				.onClick(() => {
					navigator.clipboard.writeText(getVaultAbsolutePath(this.app));
				})
			)
			.addButton(btn => btn
				.setTooltip("Add a new variable")
				.setIcon("import-glyph")
				.onClick(() => {
					this.plugin.settings.variables.push({
						vaultPath: "",
						name: "",
						value: ""
					});
					this.display();
				})
			);

		for (let i = 0; i < this.plugin.settings.variables.length; i++) {
			const variable = this.plugin.settings.variables[i];

			if (this.plugin.settings.filter && !variable.name.includes(this.plugin.settings.filter)) {
				continue;
			}

			new Setting(containerEl)
				.setClass("plugin-vars-list")
				.setName(`Variable`)
				.addText(text => text
					.setPlaceholder('vault path')
					.setValue(this.plugin.settings.variables[i].vaultPath)
					.onChange(async (value) => {
						console.log('Updated var vault path: ' + value);
						this.plugin.settings.variables[i].vaultPath = value;
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('name')
					.setValue(this.plugin.settings.variables[i].name)
					.onChange(async (value) => {
						console.log('Updated var name: ' + value);
						this.plugin.settings.variables[i].name = value;
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('value')
					.setValue(this.plugin.settings.variables[i].value)
					.onChange(async (value) => {
						console.log('Updated var value: ' + value);
						this.plugin.settings.variables[i].value = value;
						await this.plugin.saveSettings();
					}))
				.addExtraButton(btn => btn
					.setIcon("cross-in-box")
					.setTooltip("Delete this variable")
					.onClick(() => {
						this.plugin.settings.variables.splice(i, 1);
						this.display();
					})
				);

		}

	}
}
