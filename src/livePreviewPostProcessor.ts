import { RangeSetBuilder } from "@codemirror/rangeset";
import { Compartment, Extension } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { debounce, editorLivePreviewField } from "obsidian";
import VariablesPlugin from "./main";
import { getLivePreviewRanges } from "./utils";

class LivePreviewPostProcessor implements PluginValue {
    obsPlugin: VariablesPlugin;
    decorations: DecorationSet = new RangeSetBuilder<Decoration>().finish();
    debouncedRefresh = debounce(this.applyPostProcessing, 1000, true);

    constructor(view: EditorView, plugin: VariablesPlugin) {
        this.obsPlugin = plugin;
    }

    update(update: ViewUpdate) {
        let builder = new RangeSetBuilder<Decoration>();
        if (update.state.field(editorLivePreviewField)) {
            for (let { from, to } of getLivePreviewRanges(update.view)) {

                let fromLine = update.view.state.doc.lineAt(from)
                if (this.obsPlugin.settings.debugMode) {
                    builder.add(fromLine.from, fromLine.from, debugLineDeco);
                }
                builder.add(fromLine.from, fromLine.from, livePreviewLineDeco);
            }

            this.debouncedRefresh();
        }
        this.decorations = builder.finish();
    }

    applyPostProcessing() {
        // console.log(`[${new Date().toISOString()}] Applying post processing`);
        // let lpLineDivs = document.querySelectorAll("div.plugin-vars-live-preview");
        // for (let i = 0; i < this.obsPlugin.settings.applicableVarIndexes.length; i++) {
        //     const variable = this.obsPlugin.settings.variables[this.obsPlugin.settings.applicableVarIndexes[i]];

        //     lpLineDivs.forEach((v, k, p) => {
        //         console.log(v.innerHTML)
        //         v.innerHTML = v.innerHTML.replaceAll(variable.name, variable.value);
        //     });
        // }
    }
}

class VarWidget extends WidgetType {
    constructor(readonly value: string) { super() }

    eq(other: VarWidget) { return other.value == this.value }

    // Ideally we can output a simple string but in the meantime, we use a span
    // https://discuss.codemirror.net/t/can-a-replacing-decoration-generate-a-string-instead-of-an-htmlelement/4146
    toDOM() {
        let wrap = document.createElement("span");
        wrap.innerHTML = this.value;
        return wrap
    }

    ignoreEvent() { return false }
}

const debugTheme = EditorView.baseTheme({
    "&light .cm-debug": { backgroundColor: "#597f7f" },
    "&dark .cm-debug": { backgroundColor: "#597f7f" }
});
const debugLineDeco = Decoration.line({
    attributes: { class: "cm-debug" }
});

const livePreviewLineDeco = Decoration.line({
    attributes: { class: "plugin-vars-live-preview" }
});

export function livePreviewPostProcessorPlugin(plugin: VariablesPlugin): Extension {
    return [
        debugTheme,
        ViewPlugin.define(v => new LivePreviewPostProcessor(v, plugin), {
            decorations: v => v.decorations
        })
    ]
}