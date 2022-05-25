#!/usr/bin/env bash

rm -r dist/
mkdir dist/
cp src/tc.js dist/
cp src/game-shims.js dist/
npx esbuild --bundle src/app.js --outdir=dist --minify --sourcemap
