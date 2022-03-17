import { DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
//import { Facet, Extension } from "@codemirror/state"
//import { RangeSetBuilder } from "@codemirror/rangeset"

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
//         let step = view.state.facet(stepSize)
//         let builder = new RangeSetBuilder<Decoration>()
//         for (let { from, to } of view.visibleRanges) {
//             for (let pos = from; pos <= to;) {
//                 let line = view.state.doc.lineAt(pos)
//                 if ((line.number % step) == 0)
//                     builder.add(line.from, line.from, stripe)
//                 pos = line.to + 1
//             }
//         }
//         console.log("End stripeDeco");
//         return builder.finish()
//     }
// }, {
//     decorations: v => v.decorations
// });

export const activeVisualLine = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        observer: MutationObserver;
        highlightLayerEl: HTMLElement;

        constructor(view: EditorView) {
            this.createObserver(view);
        }

        createObserver(view: EditorView) {
            const config = { attributes: true, childList: true, subtree: true },
                selectionLayer = view.dom.querySelector(".cm-selectionLayer"),
                cursorLayer = view.dom.querySelector(".cm-cursorLayer"),
                contentDOM = view.dom;
            if (!selectionLayer || !cursorLayer) return;
            document.body.addClass("active-visual-line");
            this.highlightLayerEl = view.scrollDOM.createDiv("cm-highlightLayer");
            this.highlightLayerEl.ariaHidden = "true";
            const visualLineEl = this.highlightLayerEl.createDiv("cm-active-visual-line");
            let scrollBarProps = getComputedStyle(view.dom, "::-webkit-scrollbar");
            let scrollBarsEnabled = scrollBarProps.getPropertyValue("display");
            let scrollbarWidth = scrollBarsEnabled === "none" ? 0 : parseInt(scrollBarProps.getPropertyValue("width"));
            console.log("scr", scrollbarWidth);
            this.observer = new MutationObserver((mutationsList, observer) => {
                mutationsList.forEach(mutation => {
                    let height: number, top: number;
                    if (mutation.type === "childList") {
                        let cursorEl = Array.from(mutation.addedNodes).find(
                            el => el instanceof HTMLElement && el.hasClass("cm-cursor-primary")
                        ) as HTMLElement;
                        if (cursorEl) {
                            height = parseInt(cursorEl.style.height);
                            top = parseInt(cursorEl.style.top);
                        }
                    } else if (mutation.target instanceof HTMLElement && mutation.target.hasClass("cm-cursor-primary")) {
                        height = parseInt(mutation.target.style.height);
                        top = parseInt(mutation.target.style.top);
                    }
                    if (height && top) {
                        let left = contentDOM.offsetLeft,
                            width = contentDOM.offsetWidth - scrollbarWidth;
                        visualLineEl.setAttribute(
                            "style",
                            `height: ${height + 6}px; top: ${top - 2}px; left: ${left}px; width: ${width}px;`
                        );
                    }
                });
            });
            this.observer.observe(cursorLayer, config);
        }

        update(update: ViewUpdate) {
            if (!this.observer) this.createObserver(update.view);
        }

        destroy() {
            this.observer && this.observer.disconnect();
            this.highlightLayerEl && this.highlightLayerEl.detach();
            document.body.removeClass("active-visual-line");
        }
    }
);