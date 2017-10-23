./tools/fix_imports.sh
./tools/fix_cache.sh

rm -rf /var/www/informmapper/static
rm -rf /var/www/informmapper/templates

mv dist/* /var/www/informmapper/

rm -rf dist/

sudo systemctl restart informmapper
sudo systemctl restart nginx
