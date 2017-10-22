for i in ~/staging/dist/*.py; do
    [ -f "$i" ] || break
    cat ${i} | awk '{gsub(/.inform/,"inform")}1' > temp.txt && mv temp.txt ${i}
done

rm -f temp.txt
