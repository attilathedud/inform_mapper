#!/bin/bash
# A helper script that takes the contents of the dist folder, applies some fixes to them for prod
# and then moves them to the website's directory.

./tools/fix_imports.sh
./tools/fix_cache.sh

rm -rf /var/www/informmapper/static
rm -rf /var/www/informmapper/templates

mv dist/* /var/www/informmapper/

rm -rf dist/

sudo systemctl restart informmapper
sudo systemctl restart nginx

echo 'Deploy successful'
