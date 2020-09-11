import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import html from '@open-wc/rollup-plugin-html';
import {Minimatch} from 'minimatch';

let copyTargets = [
  {src: 'images/**', dest: 'build/release/images'},
  // include all webcomponents
  {
    src: "node_modules/vl-ui-*/dist/*.css",
    dest: 'build/release/node_modules'
  },
  {
    src: "node_modules/vl-ui-*/dist/*.js",
    dest: 'build/release/node_modules'
  },
  {
    src: "node_modules/**",
    dest: 'build/release/node_modules'
  },
  {
    src: "i18n/*.json",
    dest: 'build/release/i18n'
  },
  {
    src: "node_modules/@govflanders/vl-ui-*/dist/js/*.js",
    dest: 'build/release/node_modules'
  },
  {
    src: "node_modules/@webcomponents/**/*",
    dest: 'build/release/node_modules'
  },
  {
    src: "node_modules/document-register-element/**/*",
    dest: 'build/release/node_modules'
  },
  {
    src: "node_modules/tinymce/**/*",
    dest: 'build/release/node_modules'
  },
  {
    src: "robots.txt",
    dest: 'build/release'
  }
];

function isExternal(path) {
  return copyTargets.map(target => {
    if (target.src.indexOf("/") > 0 || target.src.indexOf("/") < 0) {
      return "/" + target.src;
    }
    return target.src;
  }).some(p => new Minimatch(p).match(path));
}

export default {
  input: './index.html',
  output: {
    dir: 'build/release',
    format: 'es'
  },
  external: isExternal,
  plugins: [
    html(),
    copy({
      targets: copyTargets,
      flatten: false
    }),
    resolve(),
    commonjs({
      include: 'node_modules/**'
    })
  ]
};
