#!/usr/bin/env bash

npx esbuild --bundle src/app.js --outdir=dist --minify --sourcemap
cp src/tc.js dist/
