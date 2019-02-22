/* -*- mode: typescript; -*- */
import { join } from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import { uglify } from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import gzip from 'rollup-plugin-gzip';
import visualize from 'rollup-plugin-visualizer';
import postcss_import from 'postcss-import';
import { compress } from 'node-zopfli';

const { stringify } = JSON;

const {
    npm_package_version: version,
    npm_package_config_output_directory: outdir,
    DEV: devel,
    BENCH: bench,
    DEBUG: debug,
} = process.env;

const distdir = outdir || 'dist';

export default {
    context: 'this',
    input: `src/client.ts`,
    output: {
        file: join(distdir, `client_${version}.min.js`),
        format: 'cjs',
        sourcemap: true
    },
    watch: {
        include: 'src/**',
    },
    plugins: [
        postcss({
            extract: true,
            minimize: true,
            sourceMap: true,
            plugins: [
                postcss_import({
                    path: ['node_modules']
                })
            ]
        }),
        nodeResolve({
            browser: true,
        }),
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    module: 'es6'
                }
            },
            //rollupCommonJSResolveHack: true,
            objectHashIgnoreUnknownHack: true,
        }),
        replace({
            'process.env.npm_package_version': stringify(version),
            'process.env.NODE_ENV': stringify(devel ? 'development' : 'production'),
            'process.env.BENCH_PATCH': bench && /patch/i.test(bench) ? 'true' : 'false',
            'process.env.BENCH_VIEW': bench && /view/i.test(bench) ? 'true' : 'false',
            'process.env.DEBUG_VIEW': debug && /view/i.test(bench) ? 'true' : 'false',
        }),
        uglify({
            ie8: true,
            mangle: {
                toplevel: true,
                keep_fnames: false,
            },
            compress: {
                toplevel: true,
                keep_fargs: false,
                keep_fnames: false,
                warnings: true,
                inline: 2,
                passes: 2,
            },
            output: {
                comments: false
            }
        }),
        visualize({
            filename: join(distdir, 'stats.html'),
            sourcemap: true,
        }),
        gzip({
            customCompression: content => compress(Buffer.from(content), 'deflate'),
            additionalFiles: [
                join(distdir, `client_${version}.min.css`),
                join(distdir, 'client.html')
            ],
        })
    ],
}
