#!/usr/bin/env bash

echo http://$(hostname -I | awk '{print $1}'):8000
python3 -m http.server

