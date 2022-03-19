import { RangeSetBuilder } from "@codemirror/rangeset";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { editorLivePreviewField } from "obsidian";

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

export const LivePreviewPostProcessor = [debugTheme, ViewPlugin.fromClass(
    class {
        decorations: DecorationSet = new RangeSetBuilder<Decoration>().finish();

        constructor(view: EditorView) { }

        update(update: ViewUpdate) {
            console.log("update()");

            let variables = [{
                name: "$var",
                value: "replacement"
            }];

            //let widgets = [];
            let builder = new RangeSetBuilder<Decoration>()
            if (update.state.field(editorLivePreviewField)) {
                for (let { from, to } of getLivePreviewRanges(update.view)) {
                    if (true) {
                        let fromLine = update.view.state.doc.lineAt(from)
                        builder.add(fromLine.from, fromLine.from, debugStripe);
                    }


                    let substring = update.view.state.doc.sliceString(from, to)
                    if (!substring) continue;

                    console.log(`${from}[${substring}]${to}`)

                    for (let i = 0; i < variables.length; i++) {
                        let idx = 0;
                        const variable = variables[i];

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
            //this.decorations = Decoration.set(widgets);
            this.decorations = builder.finish();
        }

        destroy() { }
    }, {
    decorations: v => v.decorations
})];