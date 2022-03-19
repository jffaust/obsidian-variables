import { RangeSetBuilder } from "@codemirror/rangeset";
import { Compartment, Extension } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { editorLivePreviewField } from "obsidian";
import VariablesPlugin from "./main";

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

function getLivePreviewRanges(view: EditorView) {

    let selectedLines = new Set();
    for (let { from, to } of view.state.selection.ranges) {
        //algo can likely be improved for large selections
        for (let pos = from; pos <= to; pos++) {
            let line = view.state.doc.lineAt(pos);
            selectedLines.add(line.number);
        }
    }

    let livePreviewLines = new Set<number>();
    for (let { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to; pos++) {

            let line = view.state.doc.lineAt(pos);
            if (!selectedLines.has(line.number)) {
                livePreviewLines.add(line.number);
            }
        }
    }

    let livePreviewRanges = [];
    for (let lineNumber of livePreviewLines) {
        let line = view.state.doc.line(lineNumber)
        livePreviewRanges.push({ from: line.from, to: line.to });
    }

    return livePreviewRanges;
}

const debugTheme = EditorView.baseTheme({
    "&light .cm-debug": { backgroundColor: "#597f7f" },
    "&dark .cm-debug": { backgroundColor: "#597f7f" }
})
const debugStripe = Decoration.line({
    attributes: { class: "cm-debug" }
})

export function livePreviewPostProcessorPlugin(plugin: VariablesPlugin): Extension {
    return [
        debugTheme,
        ViewPlugin.define(v => new LivePreviewPostProcessor(v, plugin), {
            decorations: v => v.decorations
        })
    ]
}

class LivePreviewPostProcessor implements PluginValue {
    obsPlugin: VariablesPlugin;
    decorations: DecorationSet = new RangeSetBuilder<Decoration>().finish();

    constructor(view: EditorView, plugin: VariablesPlugin) {
        this.obsPlugin = plugin;
    }

    update(update: ViewUpdate) {
        console.log("update()");

        let builder = new RangeSetBuilder<Decoration>();
        if (update.state.field(editorLivePreviewField)) {
            for (let { from, to } of getLivePreviewRanges(update.view)) {
                if (this.obsPlugin.debugMode) {
                    let fromLine = update.view.state.doc.lineAt(from)
                    builder.add(fromLine.from, fromLine.from, debugStripe);
                }

                let substring = update.view.state.doc.sliceString(from, to)
                if (!substring) continue;

                console.log(`${from}[${substring}]${to}`)

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

                            console.log(`matched '${variable.name}' at [${start}->${end}]`)
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