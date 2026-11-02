#!/bin/sh
# ./add-guests.sh "Name One" "Name Two" → appends to guests.txt, rebuilds pages, commits, pushes, prints the new links.
set -e
cd "$(dirname "$0")"
[ $# -gt 0 ] || { echo 'usage: ./add-guests.sh "Guest Name" ...'; exit 1; }
for n in "$@"; do printf '%s\n' "$n" >> guests.txt; done
node build.mjs > /dev/null
git add -A && git commit -qm "Add guests: $*" && git push -q
tail -n $# links.txt
