#!/usr/bin/env bash

echo http://$(hostname -I | awk '{print $1}'):8000
(trap 'kill 0' SIGINT; python3 -m http.server & npx esbuild --bundle src/app.js --outdir=dist --minify --sourcemap --watch)
