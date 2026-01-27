// Wrapper to allow TypeORM CLI to load the TypeScript data-source using ts-node
require('ts-node').register({ transpileOnly: true });
module.exports = require('./data-source.ts').default;
