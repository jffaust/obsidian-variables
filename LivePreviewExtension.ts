import { EditorView, PluginValue, ViewUpdate } from '@codemirror/view';
import { Notice } from 'obsidian';

export class LivePreviewExtension implements PluginValue {
    private readonly view: EditorView;

    constructor(view: EditorView) {
        this.view = view;
    }

    public destroy(): void {
    }

    public update(_update: ViewUpdate): void {
        console.log(_update.changes.toJSON());
    }
}