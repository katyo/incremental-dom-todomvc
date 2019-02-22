import { Store, get, set, over, toggle, change } from './store';
import { open, close, tag, text, nokey } from './core';
import { KeyCode } from './keys';

export interface Data {
    content: string,
    completed: boolean,
}

export interface State extends Data {
    editing: boolean,
    handler: Handlers,
}

export interface On {
    remove(): void;
}

export interface Handlers {
    toggle: { change(): void },
    label: { dblclick(): void },
    remove: { click(): void },
    entry: { blur(e: UIEvent): void, keydown(e: KeyboardEvent): void },
}

export function toggle_completed(store: Store<State>) {
    over(store, toggle('completed'));
}

export function init(store: Store<State>, on: On, { content = "", completed = false }: Partial<Data> = {}) {
    set(store, {
        content,
        completed,
        editing: false,
        handler: {
            toggle: { change() { toggle_completed(store); } },
            label: { dblclick() { over(store, change({editing: true})); } },
            remove: { click() { on.remove(); } },
            entry: {
                blur(e: UIEvent) {
                    over(store, change({
                        content: (e.target as HTMLInputElement).value,
                        editing: false
                    }));
                },
                keydown(e: KeyboardEvent) {
                    if (e.keyCode == KeyCode.Enter || e.keyCode == KeyCode.Escape) {
                        over(store, change({
                            content: (e.target as HTMLInputElement).value,
                            editing: false
                        }));
                    }
                }
            },
        },
    });
}

export function view(store: Store<State>, key: number | undefined = nokey) {
    const { content, completed, editing, handler } = get(store);

    open('li', key, nokey, 'class', (completed ? 'completed ' : '') + (editing ? 'editing' : ''));
    open('div', nokey, ['class', 'view']);
    tag('input', nokey, ['class', 'toggle', 'type', 'checkbox', 'onchange', handler.toggle.change], 'checked', completed || undefined);
    open('label', nokey, ['ondblclick', handler.label.dblclick]);
    text(content);
    close('label');
    tag('button', nokey, ['class', 'destroy', 'onclick', handler.remove.click]);
    close('div');
    const entry = tag('input', nokey, ['class', 'edit', 'onblur', handler.entry.blur, 'onkeydown', handler.entry.keydown], 'value', content) as HTMLInputElement;
    if (editing) {
        entry.focus();
        entry.selectionStart = entry.selectionEnd = entry.value.length;
    }
    close('li');
}
