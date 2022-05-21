#!/usr/bin/env bash

mkdir dist/
cp src/tc.js dist/
cp src/game-shims.js dist/
npx esbuild --bundle src/app.js --outdir=dist --minify --sourcemap
