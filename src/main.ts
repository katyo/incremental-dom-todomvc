import { Store, set, lens } from './store';
import { open, close, start, end, attr, tag, text, nokey, render } from './core';
import { page_lite } from './page';
import * as Todo from './todo';

const page_props = {
    styles: [{ link: `client_${process.env.npm_package_version}.min.css` }],
    scripts: [{ link: `client_${process.env.npm_package_version}.min.js` }],
    settings: { viewport: "width=device-width, initial-scale=1" },
    title: "TodoMVC",
    body: ['class', 'learn-bar'],
};

export interface State {
    todo: Todo.State,
}

export function init(store: Store<State>) {
    set(store, {});

    Todo.init(lens(store, 'todo'), { change() {} });
}

export function view(store: Store<State>) {
    page_lite(page_props, body, store);
}

function body(store: Store<State>) {
    learn();
    render(Todo.view, lens(store, 'todo'));
    footer();
}

interface SourceLink {
    title: string;
    url: string;
    local?: true;
    kind?: string;
}

interface SourceLinksGroup {
    title: string;
    links: SourceLink[];
}

const source_links: SourceLinksGroup[] = [
    {
        title: 'Example',
        links: [
            {
                title: 'Source',
                url: 'https://github.com/katyo/literium/tree/master/examples/todomvc',
            }
        ]
    }
];

function learn() {
    open('aside', nokey, ['class', 'learn']);
    open('header');
    open('h3');
    text('IDOM TodoMVC');
    close('h3');
    open('span', nokey, ['class', 'source-links']);
    for (const { title, links } of source_links) {
        open('h5');
        text(title);
        close('h5');
        let n = 0;
        for (const { title, url, kind, local } of links) {
            if (n++) text(', ');
            start('a', nokey, ['href', url, 'data-type', local ? 'local' : false]);
            if (kind) attr('class', `${kind}-link`);
            end();
            text(title);
            close('a');
        }
    }
    close('span');
    close('header');
    tag('hr');
    open('blockquote', nokey, ['class', 'quote speech-bubble']);
    open('p');
    text('Literium is an ultra-light client-side framework for modern Web-application. Its core principles are explicit state, controllable behavior, declarative code, efficiency, simplicity and flexibility.');
    close('p');
    close('blockquote');
    open('footer');
    tag('hr');
    open('em');
    text('If you found unexpected behavior in example, or you have something helpful ideas, please ');
    open('a', nokey, ['href', 'https://github.com/katyo/literium/issues']);
    text('let me know');
    close('a');
    text('.');
    close('em');
    close('footer');
    close('aside');
}

function footer() {
    open('footer', nokey, ['class', 'info']);
    open('p');
    text('Created by ');
    open('a', nokey, ['href', 'https://github.com/katyo']);
    text('Kayo');
    close('a');
    close('p');
    open('p');
    text('Not a part of ');
    open('a', nokey, ['href', 'http://todomvc.com']);
    text('TodoMVC');
    close('a');
    text(' yet now.');
    close('p');
    close('footer');
}
