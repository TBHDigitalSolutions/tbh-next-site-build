#!/usr/bin/env bash
set -euo pipefail
err=0
while IFS= read -r -d '' f; do
  base="$(basename "$f")"
  if [[ "$base" =~ [[:space:]] || "$base" =~ [A-Z] || "$base" =~ __ || "$base" =~ -- ]]; then
    echo "Invalid filename: $f"
    err=1
  fi
done < <(find documents -type f -print0)
exit $err
