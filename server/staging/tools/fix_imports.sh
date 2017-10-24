#!/bin/bash
# Run by deploy.sh. Since the package structure is different on the local dev vs the server,
# fix up the import statements.

for i in ~/staging/dist/*.py; do
    [ -f "$i" ] || break
    cat ${i} | awk '{gsub(/.inform/,"inform")}1' > temp.txt && mv temp.txt ${i}
done

rm -f temp.txt
