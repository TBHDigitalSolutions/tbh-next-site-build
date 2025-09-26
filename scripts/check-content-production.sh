#!/usr/bin/env bash
set -euo pipefail
ROOT="src/data/packages/content-production"
REQ=(bundle.ts includes.ts outcomes.ts faqs.ts narrative.ts index.ts)

fail=0
while IFS= read -r -d '' b; do
  pkgdir="$(dirname "$b")"
  missing=()
  for f in "${REQ[@]}"; do
    [[ -f "$pkgdir/$f" ]] || missing+=("$f")
  done
  if (( ${#missing[@]} )); then
    echo "❌ ${pkgdir#"$ROOT/"} missing: ${missing[*]}"
    fail=1
  fi
done < <(find "$ROOT" -type f -name 'bundle.ts' -print0)

if [[ $fail -eq 0 ]]; then
  echo "✅ All content-production packages have required files."
fi
exit $fail
