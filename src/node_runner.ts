import { JSDOM } from 'jsdom';

const doctype = '<!DOCTYPE html>';
const { window: { Node } } = new JSDOM(doctype);
(global as any).Node = Node;
(global as any).requestAnimationFrame = (fn: () => void) => {
    return setTimeout(fn, 17);
};

import { patch } from './incremental-dom';
import { Init, View, render } from './core';
import { store } from './store';

const now = typeof performance == 'undefined' ? () => Date.now() : () => performance.now();

export function runner<State, Args extends any[]>(init: Init<State, Args>, view: View<State, Args>): (elm: Element, ...args: Args) => void {
    return (elm: Element, ...args: Args) => {
        const state = store<State, void>(refresh, undefined);
        
        init(state, ...args);

        repatch();
        
        function refresh() {}

        function repatch() {
            const start = now();
            patch(elm, redraw);
            const end = now();
            console.log('patch ', (end - start).toPrecision(3), 'mS');
        }

        function redraw() {
            render(view, state, ...args);
        }
    };
}
