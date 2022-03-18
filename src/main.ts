import { LivePreviewPostProcessor } from './LivePreviewPostProcessor';
import { App, debounce, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface VarConfig {
	vaultPath: string;
	name: string;
	value: string;
}

interface VariablesPluginSettings {
	filter: string;
	variables: VarConfig[];
	showApplicableVars: boolean;
	applicableVarIndexes: number[];
}

const DEFAULT_SETTINGS: VariablesPluginSettings = {
	filter: "",
	variables: [{
		vaultPath: "*",
		name: "demo",
		value: "swapped"
	}],
	showApplicableVars: false,
	applicableVarIndexes: [0]
}

export default class VariablesPlugin extends Plugin {
	settings: VariablesPluginSettings;
	settingsTab: VariablesSettingTab;

	async onload() {
		await this.loadSettings();

		this.settingsTab = new VariablesSettingTab(this.app, this);
		this.addSettingTab(this.settingsTab);

		this.addCommand({
			id: 'plugin-vars-manage-variables',
			name: 'Manage variables',
			callback: () => {
				//@ts-expect-error, not exposed in obsidian.d.ts
				this.app.setting.open();
				//@ts-expect-error, not exposed in obsidian.d.ts
				this.app.setting.openTabById("obsidian-variables");
			}
		});

		this.registerMarkdownPostProcessor((element, context) => {
			for (let i = 0; i < this.settings.applicableVarIndexes.length; i++) {

				const variable = this.settings.variables[this.settings.applicableVarIndexes[i]];
				element.innerHTML = element.innerHTML.replaceAll(variable.name, variable.value);
			}
		});

		this.registerEditorExtension(LivePreviewPostProcessor);
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
	return (this.app.vault.adapter as any).basePath;
}

class VariablesSettingTab extends PluginSettingTab {
	plugin: VariablesPlugin;
	debouncedRefresh = debounce(() => { this.display(); document.getElementById("plugin-vars-filter-input").focus(); }, 700, true);

	constructor(app: App, plugin: VariablesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		let pinIcon = this.plugin.settings.showApplicableVars ? "check-in-circle" : "check-small";

		new Setting(containerEl)
			.setClass("plugin-vars-header")
			.setName("Variables")
			.addText(text => text
				.setPlaceholder('Filter by variable name')
				.setValue(this.plugin.settings.filter)
				.onChange(async (value) => {
					this.plugin.settings.filter = value;
					await this.plugin.saveSettings();
					this.debouncedRefresh();
				}).inputEl.id = "plugin-vars-filter-input")
			.addButton(btn => btn
				.setTooltip("Open documentation on GitHub")
				.setIcon("help")
				.onClick(() => {
					window.open("https://github.com/jffaust/obsidian-variables", '_blank');
				})
			)
			.addButton(btn => btn
				.setTooltip("Copy current vault path")
				.setIcon("vault")
				.onClick(() => {
					navigator.clipboard.writeText(getVaultAbsolutePath(this.app));
				})
			)
			.addButton(btn => btn
				.setTooltip("Toggle between showing all variables or only the ones that apply to the current vault")
				.setIcon(pinIcon)
				.onClick(() => {
					this.plugin.settings.showApplicableVars = !this.plugin.settings.showApplicableVars;
					this.display();
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

			if (this.plugin.settings.showApplicableVars && !this.plugin.settings.applicableVarIndexes.contains(i)) {
				continue;
			}

			new Setting(containerEl)
				.setClass("plugin-vars-list")
				.setName(`Variable`)
				.addText(text => text
					.setPlaceholder('vault path')
					.setValue(this.plugin.settings.variables[i].vaultPath)
					.onChange(async (value) => {
						this.plugin.settings.variables[i].vaultPath = value;
						this.updateApplicableVars();
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('name')
					.setValue(this.plugin.settings.variables[i].name)
					.onChange(async (value) => {
						this.plugin.settings.variables[i].name = value;
						this.updateApplicableVars();
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('value')
					.setValue(this.plugin.settings.variables[i].value)
					.onChange(async (value) => {
						this.plugin.settings.variables[i].value = value;
						await this.plugin.saveSettings();
					}))
				.addExtraButton(btn => btn
					.setIcon("cross-in-box")
					.setTooltip("Delete this variable")
					.onClick(() => {
						this.plugin.settings.variables.splice(i, 1);
						this.updateApplicableVars();
						this.display();
					})
				);
		}
	}

	updateApplicableVars(): void {
		let newIndexesMap: { [key: string]: number } = {};
		for (let i = 0; i < this.plugin.settings.variables.length; i++) {
			let v = this.plugin.settings.variables[i];

			if (v.name && v.vaultPath) {
				if (newIndexesMap[v.name] == undefined) {
					if (v.vaultPath == "*" || v.vaultPath == getVaultAbsolutePath(this.app)) {
						newIndexesMap[v.name] = i;
					}
				} else {

					let currentVar = this.plugin.settings.variables[newIndexesMap[v.name]];
					if (currentVar.vaultPath == "*" && v.vaultPath == getVaultAbsolutePath(this.app)) {
						newIndexesMap[v.name] = i;
					}
				}
			}
		}

		this.plugin.settings.applicableVarIndexes = Object.values(newIndexesMap);
	}
}
