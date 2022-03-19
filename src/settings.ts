export interface VarConfig {
    vaultPath: string;
    name: string;
    value: string;
}

export interface VariablesPluginSettings {
    filter: string;
    variables: VarConfig[];
    showApplicableVars: boolean;
    applicableVarIndexes: number[];
    debugMode: boolean;
}

export const DEFAULT_SETTINGS: VariablesPluginSettings = {
    filter: "",
    variables: [{
        vaultPath: "*",
        name: "$var",
        value: "swapped"
    }],
    showApplicableVars: false,
    applicableVarIndexes: [0],
    debugMode: false
}