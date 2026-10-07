#!/usr/bin/env bash
# Builds ../public/ for Cloudflare: wraps the page (written for claude.ai Artifacts, which add the
# doctype/head themselves) in a full HTML document and copies content.js, the map data, the flags
# and the recorded voice lines next to it.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public
mkdir -p public
{
  cat <<'HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="A talking world-map game for young children: oceans, continents, countries, capitals and flags with Tully the turtle.">
<meta name="theme-color" content="#DDF1FD">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%90%A2%3C/text%3E%3C/svg%3E">
HEAD
  cat little-explorer.html
  printf '\n</html>\n'
} > public/index.html
cp -R data flags content.js public/
# recorded voice lines are optional: without them the page uses the browser's own speech
if [ -f voice/index.json ]; then cp -R voice public/; else echo "note: no voice/ recordings, using browser speech"; fi
echo "public/: $(find public -type f | wc -l | tr -d ' ') files, $(du -sh public | cut -f1)"
