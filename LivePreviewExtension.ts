import { EditorView, PluginValue } from '@codemirror/view';
import { Notice } from 'obsidian';

export class LivePreviewExtension implements PluginValue {
    private readonly view: EditorView;

    constructor(view: EditorView) {
        this.view = view;

        this.handleClickEvent = this.handleClickEvent.bind(this);
        this.view.dom.addEventListener('click', this.handleClickEvent);
    }

    public destroy(): void {
        this.view.dom.removeEventListener('click', this.handleClickEvent);
    }

    private handleClickEvent(event: MouseEvent): boolean {
        const { target } = event;

        new Notice("CM click!");

        return true;
    }
}