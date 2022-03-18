import { RangeSetBuilder } from "@codemirror/rangeset";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

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

    console.log(`getLivePreviewRanges() START`)
    let selectedLines = new Set();

    console.log(view.state.selection.ranges);
    for (let { from, to } of view.state.selection.ranges) {
        //algo can likely be improved for large selections
        console.log(`checking selection range: from ${from} to ${to}`)
        for (let pos = from; pos <= to; pos++) {
            console.log(`checking pos: ${pos}`)
            let line = view.state.doc.lineAt(pos);
            selectedLines.add(line.number);
        }
    }

    console.log(`calculated selected lines:`)
    console.log(selectedLines);

    let livePreviewLines = new Set<number>();
    for (let { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to; pos++) {

            let line = view.state.doc.lineAt(pos);
            if (!selectedLines.has(line.number)) {
                livePreviewLines.add(line.number);
            }
        }
    }

    console.log(`calculated livepreview lines:`)
    console.log(livePreviewLines);

    let livePreviewRanges = [];
    for (let lineNumber of livePreviewLines) {
        let line = view.state.doc.line(lineNumber)
        livePreviewRanges.push({ from: line.from, to: line.to });
    }
    console.log(`getLivePreviewRanges() END`)
    return livePreviewRanges;
}

const baseTheme = EditorView.baseTheme({
    "&light .cm-zebraStripe": { backgroundColor: "#d4fafa" },
    "&dark .cm-zebraStripe": { backgroundColor: "#1a2727" }
})
const stripe = Decoration.line({
    attributes: { class: "cm-zebraStripe" }
})
export const LivePreviewPostProcessor = [baseTheme, ViewPlugin.fromClass(
    class {
        decorations: DecorationSet = new RangeSetBuilder<Decoration>().finish();

        constructor(view: EditorView) {

        }

        update(update: ViewUpdate) {
            console.log("update()");

            let variables = [{
                name: "$test",
                value: "Long text expansion"
            }];

            //let widgets = [];
            let builder = new RangeSetBuilder<Decoration>()
            for (let { from, to } of getLivePreviewRanges(update.view)) {
                let fromLine = update.view.state.doc.lineAt(from)
                let toLine = update.view.state.doc.lineAt(to)
                console.log(`Adding strip from line #${fromLine.number} to line #${toLine.number}`)
                builder.add(fromLine.from, fromLine.from, stripe);
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
            //this.decorations = Decoration.set(widgets);
            this.decorations = builder.finish();
        }

        destroy() {
        }
    }, {
    decorations: v => v.decorations
})];