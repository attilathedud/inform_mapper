## Server Design

The server is a digitalocean droplet set up using uwsgi and nginx, following the guide given by digitalocean [here.](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-uwsgi-and-nginx-on-ubuntu-16-04)

The following steps are used to deploy to server:
1. Use `gulp dist` to create a distribution package.
2. Use `scp` to transfer the files to the `staging` folder.
3. Run `deploy.sh` to fix the package and load it in the website directory.
