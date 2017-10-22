./tools/fix_imports.sh

rm -rf /var/www/informmapper/static
rm -rf /var/www/informmapper/templates

mv dist/* /var/www/informmapper/

rm -rf dist/

sudo systemctl restart informmapper
sudo systemctl restart nginx
