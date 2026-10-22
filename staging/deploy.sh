#!/usr/bin/env bash
# Publish staging/ to the repo root (the live GitHub Pages site).
#
#   bash staging/deploy.sh           copy + transform every staging file into root
#   bash staging/deploy.sh --prune   also delete root pages that no longer exist in staging
#
# Root files are generated from staging with two transforms:
#   1. one "../" is dropped from every evermore_photos/ path
#      (staging/x.html uses ../evermore_photos/, root x.html uses evermore_photos/)
#   2. style.css / main.js get a ?v=<first 8 of sha256> cache-buster
#
# Nothing is committed — review `git status` / `git diff`, then commit and push.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

prune=false
[ "${1:-}" = "--prune" ] && prune=true

css_v=$(sha256sum staging/assets/css/style.css | cut -c1-8)
js_v=$(sha256sum staging/assets/js/main.js | cut -c1-8)

# Staging-only files that must never be published
skip_staging() { case "$1" in DEPLOY.md|deploy.sh|archive/*) return 0;; esac; return 1; }
# Root-only files that have no staging counterpart
keep_root() { case "$1" in CNAME|CLAUDE.md|TRACKING.md|Evermore-StyleGuide.pdf|.*|evermore_photos/*|marketing/*|staging/*) return 0;; esac; return 1; }

copied=0
while IFS= read -r src; do
  [ -f "$src" ] || continue                # deleted in the working tree
  rel=${src#staging/}
  skip_staging "$rel" && continue
  mkdir -p "$(dirname "$rel")"
  case "$rel" in
    *.html|*.xml|*.txt|*.js|*.css|*.json)
      perl -pe "s#((?:\.\./)*)\.\./evermore_photos/#\$1evermore_photos/#g;
                s#(assets/css/style\.css)\"#\$1?v=$css_v\"#g;
                s#(assets/js/main\.js)\"#\$1?v=$js_v\"#g" "$src" > "$rel" ;;
    *) cp "$src" "$rel" ;;
  esac
  copied=$((copied + 1))
done < <(git ls-files --cached --others --exclude-standard staging)
echo "Published $copied files (style.css?v=$css_v, main.js?v=$js_v)"

# Root pages whose staging source is gone (e.g. a page that was removed)
orphans=()
while IFS= read -r f; do
  keep_root "$f" && continue
  [ -f "staging/$f" ] || orphans+=("$f")
done < <(git ls-files)

if [ ${#orphans[@]} -gt 0 ]; then
  if $prune; then
    for f in "${orphans[@]}"; do git rm -q "$f" && echo "Removed $f"; done
  else
    echo "Root files with no staging source (re-run with --prune to delete):"
    printf '  %s\n' "${orphans[@]}"
  fi
fi
