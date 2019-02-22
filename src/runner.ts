import { patch } from './incremental-dom';
import { Init, View, render } from './core';
import { store } from './store';

const now = typeof performance == 'undefined' ? () => Date.now() : () => performance.now();

export function runner<State, Args extends any[]>(init: Init<State, Args>, view: View<State, Args>): (elm: Element, ...args: Args) => void {
    return (elm: Element, ...args: Args) => {
        const state = store<State, void>(refresh, undefined);
        let frame: any = null;
        
        init(state, ...args);
        
        function refresh() {
            if (!frame) {
                console.log('schedule', frame);
                frame = requestAnimationFrame(repatch);
            }
        }

        function repatch() {
            frame = null;
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
