import { EditorView } from "@codemirror/view";
import { App } from "obsidian";

export function getVaultAbsolutePath(app: App) {
    return (this.app.vault.adapter as any).basePath;
}

export function getLivePreviewRanges(view: EditorView) {

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