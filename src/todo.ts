import { Store, get, set, over, lens, adjust, remove } from './store';
import { open, close, tag, text, nokey, render } from './core';
import { KeyCode } from './keys';
import * as Filter from './filter';
import * as Task from './task';

export interface Data {
    tasks: Task.Data[];
    filter: Filter.Filter;
}

export type Tasks = Record<number, Task.State>;

export interface State {
    tasks: Tasks;
    last_task: number;
    filter: Filter.Filter;
    filters: Filter.State[];
    handler: Handlers;
}

export interface On {
    change(): void;
}

export interface Handlers {
    entry: { keydown(e: KeyboardEvent): void },
    toggle: { click(): void },
    clear: { click(): void },
}

function add_task(store: Store<State>, data?: Partial<Task.Data>) {
    over(store, adjust('last_task', 1));
    const $ = get(store).last_task;
    console.log('add task', $);
    Task.init(lens(store, 'tasks', $), {
        remove() { over(lens(store, 'tasks'), remove($)); }
    }, data);
}

function toggle_completed(tasks: Tasks): Tasks {
    tasks = { ...tasks };
    for (const $ in tasks) {
        const task = tasks[$];
        task.completed = !task.completed;
    }
    return tasks;
}

function clear_completed(tasks: Tasks): Tasks {
    tasks = { ...tasks };
    for (const $ in tasks) {
        if (tasks[$].completed) delete tasks[$];
    }
    return tasks;
}

const task_filters: Record<Filter.Filter, (task: Task.State) => boolean> = {
    [Filter.Filter.All]: () => true,
    [Filter.Filter.Active]: task => !task.completed,
    [Filter.Filter.Completed]: task => task.completed,
};

export function init(store: Store<State>, on: On, { tasks = [], filter = Filter.Filter.All }: Partial<Data> = {}) {
    set(store, {
        tasks: {},
        last_task: 0,
        filter,
        filters: [],
        handler: {
            entry: {
                keydown(e: KeyboardEvent) {
                    const input = e.target as HTMLInputElement;
                    if (input.value != '' && e.keyCode == KeyCode.Enter) {
                        add_task(store, { content: input.value });
                        on.change();
                        input.value = '';
                    }
                }
            },
            toggle: { click() { over(lens(store, 'tasks'), toggle_completed); } },
            clear: { click() { over(lens(store, 'tasks'), clear_completed); } },
        },
    });

    for (const task of tasks) add_task(store, task);

    const on_filter = {
        select(value: Filter.Filter) {
            set(lens(store, 'filter'), value);
            //on.change();
        }
    };

    const filters = lens(store, 'filters');
    let filter_id = 0;
    
    for (const [title, value, href] of [
        ["All", Filter.Filter.All, "#/"],
        ["Active", Filter.Filter.Active, "#/active"],
        ["Completed", Filter.Filter.Completed, "#/completed"],
    ] as [string, Filter.Filter, string][]) {
        Filter.init(lens(filters, filter_id++),
                    on_filter, { title, value, href });
    }
}

export function view(store: Store<State>) {
    const { tasks, filter, filters, handler } = get(store);

    let active = 0, all = 0;
    for (const $ in tasks) {
        all ++;
        if (!tasks[$].completed) active ++;
    }

    open('section', nokey, ['class', 'todoapp']);
    open('header', nokey, ['class', 'header']);
    open('h1'); text('todos'); close('h1');
    tag('input', nokey, ['class', 'new-todo', 'placeholder', 'What needs to be done?', 'autofocus', true, 'onkeydown', handler.entry.keydown]);
    if (all) {
        open('section', nokey, ['class', 'main']);
        tag('input', nokey, ['class', 'toggle-all', 'id', 'toggle-all', 'type', 'checkbox', 'onclick', handler.toggle.click], 'checked', !active || undefined);
        open('label', nokey, ['for', 'toggle-all']); text('Mark all as complete'); close('label');
        open('ul', nokey, ['class', 'todo-list']);
        const task_filter = task_filters[filter];
        for (const $ in tasks) {
            if (task_filter(tasks[$])) {
                console.log('view task', $);
                render(Task.view, lens(store, 'tasks', +$), +$);
            }
        }
        close('ul');
        close('section');
    }
    close('header');
    open('footer', nokey, ['class', 'footer']);
    open('span', nokey, ['class', 'todo-count']);
    open('strong'); text(active); close('strong');
    text(` item${active == 1 ? '' : 's'} left`);
    close('span');
    open('ul', nokey, ['class', 'filters']);
    for (let i = 0; i < filters.length; i++) {
        render(Filter.view, lens(store, 'filters', i), filter);
    }
    close('ul');
    if (all > active) {
        open('button', nokey, ['class', 'clear-completed', 'onclick', handler.clear.click]);
        text(`Clear completed (${all - active})`);
        close('button');
    }
    close('footer');
    close('section');
}
