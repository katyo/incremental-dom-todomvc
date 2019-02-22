import { open, close, tag, text, nokey } from './core';

const empty_object = {};
const empty_array: any[] = [];
const empty_string = "";

export interface ResourceLink {
    link: string;
};

export interface ResourceData {
    data: string;
};

export type Resource = ResourceLink | ResourceData;

export interface Props {
    styles: Resource[];
    scripts: Resource[];
    charset: string;
    compat: string;
    settings: Record<string, string>;
    title: string;
    description: string;
    author: string;
    keywords: string[];
    baseHref: string;
    baseTarget: string;
    body?: any[];
};

export function page<Args extends any[]>({
    scripts = empty_array,
    styles = empty_array,
    charset = 'UTF-8',
    compat = 'IE=edge,chrome=1',
    settings = empty_object as Record<string, string>,
    title = empty_string,
    description = empty_string,
    author = empty_string,
    keywords = empty_array,
    baseHref = empty_string,
    baseTarget = empty_string,
    body
}: Partial<Props>, nodes: (...args: Args) => void, ...args: Args): void {
    //open('html');
    open('head');
    tag('meta', nokey, ['charset', charset]);
    tag('meta', nokey, ['http-equip', 'X-UA-Compatible', 'content', compat]);
    for (const name in settings) {
        tag('meta', nokey, ['name', name, 'content', settings[name]]);
    }
    for (const res of styles) {
        if ('link' in res) {
            tag('link', nokey, ['href', (res as ResourceLink).link, 'rel', 'stylesheet']);
        } else {
            open('style');
            text((res as ResourceData).data);
            close('style');
        }
    }
    if (keywords && keywords.length > 0) {
        tag('meta', nokey, ['name', 'keywords', 'content', keywords.join(' ') ]);
    }
    if (baseHref || baseTarget) tag('base', nokey, ['href', baseHref, 'target', baseTarget]);
    if (description) tag('meta', nokey, ['name', 'description', 'content', description]);
    if (author) tag('meta', nokey, ['name', 'author', 'content', author]);
    if (title) {
        open('title');
        text(title);
        close('title');
    }
    close('head');
    open('body', nokey, body);
    nodes(...args);
    for (const res of scripts) {
        if ('link' in res) {
            tag('script', nokey, ['src', (res as ResourceLink).link]);
        } else {
            open('script');
            text((res as ResourceData).data);
            close('script');
        }
    }
    close('body');
    //close('html');
}

export interface PropsLite {
    styles: Resource[];
    scripts: Resource[];
    compat: string;
    settings: Record<string, string>;
    title: string;
    body?: any[];
};

export function page_lite<Args extends any[]>({
    scripts = empty_array,
    styles = empty_array,
    compat = 'IE=edge,chrome=1',
    settings = empty_object as Record<string, string>,
    title = empty_string,
    body
}: Partial<PropsLite>, nodes: (...args: Args) => void, ...args: Args) {
    //open('html');
    open('head');
    tag('meta', nokey, ['charset', 'UTF-8']);
    tag('meta', nokey, ['http-equip', 'X-UA-Compatible', 'content', compat]);
    for (const name in settings) {
        tag('meta', nokey, ['name', name, 'content', settings[name]]);
    }
    for (const res of styles) {
        if ('link' in res) {
            tag('link', nokey, ['href', (res as ResourceLink).link, 'rel', 'stylesheet']);
        } else {
            open('style');
            text((res as ResourceData).data);
            close('style');
        }
    }
    if (title) {
        open('title');
        text(title);
        close('title');
    }
    close('head');
    open('body', nokey, body);
    nodes(...args);
    for (const res of scripts) {
        if ('link' in res) {
            tag('script', nokey, ['src', (res as ResourceLink).link]);
        } else {
            open('script');
            text((res as ResourceData).data);
            close('script');
        }
    }
    close('body');
    //close('html');
}
