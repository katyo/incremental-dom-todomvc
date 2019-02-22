import { writeFileSync } from 'fs';
import { runner } from './node_runner';
import * as Main from './main';

import { JSDOM } from 'jsdom';

const doctype = '<!DOCTYPE html>';

const { window: { document } } = new JSDOM(doctype);

runner(Main.init, Main.view)(document.documentElement);

writeFileSync('dist/client.html', doctype + document.documentElement.outerHTML);
