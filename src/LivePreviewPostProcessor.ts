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
        console.log(`checking selection range: from ${from} to ${to}`)
        for (let pos = from; pos <= to; pos++) {
            console.log(`checking pos: ${pos}`)
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
                name: "$test",
                value: "Long text expansion"
            }];

            //let widgets = [];
            let builder = new RangeSetBuilder<Decoration>()
            if (update.state.field(editorLivePreviewField)) {
                for (let { from, to } of getLivePreviewRanges(update.view)) {
                    if (true) {
                        let fromLine = update.view.state.doc.lineAt(from)
                        builder.add(fromLine.from, fromLine.from, debugStripe);
                    }

                    // console.log(`from ${from} to ${to}`)
                    // let substring = update.view.state.doc.sliceString(from, to)

                    // for (let i = 0; i < variables.length; i++) {
                    //     let idx = 0;
                    //     const variable = variables[i];
                    //     console.log(`for var named '${variable.name}'`)

                    //     do {
                    //         idx = substring.indexOf(variable.name, idx);

                    //         if (idx >= 0) {
                    //             let deco = Decoration.replace({
                    //                 widget: new VarWidget(variable.value)
                    //             });

                    //             let start = from + idx;
                    //             let end = start + variable.value.length
                    //             widgets.push(deco.range(start, end));

                    //             idx += variable.name.length + 1;
                    //         }
                    //     } while (idx > 0);
                    // }
                }
            }
            //this.decorations = Decoration.set(widgets);
            this.decorations = builder.finish();
        }

        destroy() { }
    }, {
    decorations: v => v.decorations
})];