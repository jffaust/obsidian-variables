import { RangeSetBuilder } from "@codemirror/rangeset";
import { Compartment, Extension } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { editorLivePreviewField } from "obsidian";
import VariablesPlugin from "./main";
import { getLivePreviewRanges } from "./utils";

class LivePreviewPostProcessor implements PluginValue {
    obsPlugin: VariablesPlugin;
    decorations: DecorationSet = new RangeSetBuilder<Decoration>().finish();

    constructor(view: EditorView, plugin: VariablesPlugin) {
        this.obsPlugin = plugin;
    }

    update(update: ViewUpdate) {
        let builder = new RangeSetBuilder<Decoration>();
        if (update.state.field(editorLivePreviewField)) {
            for (let { from, to } of getLivePreviewRanges(update.view)) {
                if (this.obsPlugin.settings.debugMode) {
                    let fromLine = update.view.state.doc.lineAt(from)
                    builder.add(fromLine.from, fromLine.from, debugStripe);
                }

                let substring = update.view.state.doc.sliceString(from, to)
                if (!substring) continue;

                for (let i = 0; i < this.obsPlugin.settings.applicableVarIndexes.length; i++) {

                    let idx = 0;
                    const varIndex = this.obsPlugin.settings.applicableVarIndexes[i];
                    const variable = this.obsPlugin.settings.variables[varIndex];


                    do {
                        //could potentially use MatchDecorator to support regular expressions
                        //https://codemirror.net/6/docs/ref/#view.MatchDecorator
                        idx = substring.indexOf(variable.name, idx);

                        if (idx >= 0) {
                            let start = from + idx;
                            let end = start + variable.name.length;

                            let deco = Decoration.replace({
                                widget: new VarWidget(variable.value)
                            });

                            builder.add(start, end, deco);

                            idx += variable.name.length + 1;
                        }
                    } while (idx > 0);
                }
            }
        }
        this.decorations = builder.finish();
    }
}

class VarWidget extends WidgetType {
    constructor(readonly value: string) { super() }

    eq(other: VarWidget) { return other.value == this.value }

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
const debugStripe = Decoration.line({
    attributes: { class: "cm-debug" }
});

export function livePreviewPostProcessorPlugin(plugin: VariablesPlugin): Extension {
    return [
        debugTheme,
        ViewPlugin.define(v => new LivePreviewPostProcessor(v, plugin), {
            decorations: v => v.decorations
        })
    ]
}