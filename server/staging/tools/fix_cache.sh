cache_hash=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

for i in ~/staging/dist/templates/*.html; do
    [ -f "$i" ] || break
    cat ${i} | awk -v hash="$cache_hash" '{gsub(/?v=/,"?v="hash)}1' > temp.txt && mv te$
done

rm -f temp.txt
