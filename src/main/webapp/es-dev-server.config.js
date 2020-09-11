const proxy = require('koa-proxies');
const cjsTransformer = require('es-dev-commonjs-transformer');

module.exports = {
  port: 8000,
  watch: true,
  // Om call naar ibo te laten lukken.
  // Voeg "127.0.0.1 local.omgeving.vlaanderen.be" toe aan /etc/hosts indien niet werkt
  hostname: 'local.omgeving.vlaanderen.be',
  nodeResolve: true,
  appIndex: 'index.html',
  moduleDirs: ['node_modules'],
  open: true,
  responseTransformers: [
    cjsTransformer()
  ],
  middlewares: [
    proxy('/geotiff/**', {
      target: 'http://localhost:8080',
    }),
    proxy('/admin/**', {
      target: 'http://localhost:8080',
    }),
    proxy('/login', {
      target: 'http://localhost:8080',
    }),
  ],
};
