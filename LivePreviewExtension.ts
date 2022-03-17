// import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
// import { Facet, Extension } from "@codemirror/state"
// import { RangeSetBuilder } from "@codemirror/rangeset"

// const baseTheme = EditorView.baseTheme({
//     "&light .cm-zebraStripe": { backgroundColor: "#d4fafa" },
//     "&dark .cm-zebraStripe": { backgroundColor: "#1a2727" }
// });

// const stepSize = Facet.define<number, number>({
//     combine: values => values.length ? Math.min(...values) : 2
// });

// export function zebraStripes(options: { step?: number } = {}): Extension {
//     return [
//         baseTheme,
//         options.step == null ? [] : stepSize.of(options.step),
//         showStripes
//     ]
// }

// const stripe = Decoration.line({
//     attributes: { class: "cm-zebraStripe" }
// });


// const showStripes = ViewPlugin.fromClass(class {
//     private readonly view: EditorView;
//     decorations: DecorationSet;

//     constructor(view: EditorView) {
//         this.view = view;
//     }

//     public destroy(): void {
//     }

//     public update(_update: ViewUpdate): void {
//         console.log("before update");
//         if (_update.docChanged || _update.viewportChanged) {
//             //this.decorations = this.stripeDeco(_update.view)
//             console.log("update decorations");
//         }
//     }

//     stripeDeco(view: EditorView) {
//         console.log("Start stripeDeco");
//         //let step = view.state.facet(stepSize)
//         let builder = new RangeSetBuilder<Decoration>()
//         // for (let { from, to } of view.visibleRanges) {
//         //     for (let pos = from; pos <= to;) {
//         //         let line = view.state.doc.lineAt(pos)
//         //         if ((line.number % step) == 0)
//         //             builder.add(line.from, line.from, stripe)
//         //         pos = line.to + 1
//         //     }
//         // }
//         console.log("End stripeDeco");
//         return builder.finish()
//     }
// }, {
//     decorations: v => v.decorations
// });