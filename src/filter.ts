import { Store, get, set } from './store';
import { open, close, text, nokey } from './core';

export const enum Filter {
    All,
    Active,
    Completed,
}

export interface Data {
    title: string,
    value: Filter,
    href: string,
}

export interface On {
    select(value: Filter): void,
}

interface Handlers {
    click(): void,
}

export interface State extends Data {
    handler: Handlers,
}

export function init(store: Store<State>, on: On, { title = '', value = Filter.All, href = '' }: Partial<Data>) {
    set(store, {
        title, value, href,
        handler: {
            click() { on.select(value); }
        }
    });
}

export function view(state: Store<State>, active: Filter) {
    const { title, value, href, handler } = get(state);
    const selected = value == active;
    open('li');
    open('a', nokey, ['href', href], 'class', selected ? 'selected' : '', 'onclick', selected ? undefined : handler.click);
    text(title);
    close('a');
    close('li');
}
