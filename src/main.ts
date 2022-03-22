import { livePreviewPostProcessorPlugin } from './livePreviewPostProcessor';
import { Plugin } from 'obsidian';
import { getVaultAbsolutePath } from './utils';
import { DEFAULT_SETTINGS, VariablesPluginSettings, VariablesSettingTab } from './settings';

export default class VariablesPlugin extends Plugin {
	settings: VariablesPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new VariablesSettingTab(this.app, this));

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

		this.registerEditorExtension(livePreviewPostProcessorPlugin(this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateApplicableVars(): void {
		let newIndexesMap: { [key: string]: number } = {};
		for (let i = 0; i < this.settings.variables.length; i++) {
			let v = this.settings.variables[i];

			if (v.name && v.vaultPath) {
				if (newIndexesMap[v.name] == undefined) {
					if (v.vaultPath == "*" || v.vaultPath == getVaultAbsolutePath(this.app)) {
						newIndexesMap[v.name] = i;
					}
				} else {

					let currentVar = this.settings.variables[newIndexesMap[v.name]];
					if (currentVar.vaultPath == "*" && v.vaultPath == getVaultAbsolutePath(this.app)) {
						newIndexesMap[v.name] = i;
					}
				}
			}
		}

		this.settings.applicableVarIndexes = Object.values(newIndexesMap);

		let debugMode = false;
		for (let i = 0; i < this.settings.applicableVarIndexes.length; i++) {

			const varIndex = this.settings.applicableVarIndexes[i];
			const variable = this.settings.variables[varIndex];
			if (variable.name == "$DEBUG" && variable.value == "true") {
				debugMode = true;
			}
		}

		this.settings.debugMode = debugMode;
	}
}
