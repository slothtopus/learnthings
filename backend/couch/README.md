# Deploying on Digital Ocean

First we have to set up a buildx environment because we need to build a x64 container (because Digital Ocean is x64) on an M4 Mac which is ARM64. This only needs to be done once.

```
docker buildx create --name multiarch-builder --use --driver docker-container
docker buildx inspect --bootstrap
```

Build the container and push it to the docker registry.

```
# Login to the Docker hub registry
docker login

# tag is [registry/][namespace/]repository[:tag]
# registry can be omitted, in which case docker.io (Docker Hub) is used
# repository is usually the app and tag should be the version
docker buildx build --platform linux/amd64 -t slothtopus/couchdb:dev --push .
```

Then SSH into the Digital Ocean droplet. You will need to have the SSH key saved in the `~/.ssh` folder.

```
ssh root@<droplet-ip-address>
```

On the droplet, make sure docker is installed and discover the path to the mounted volume.

```
apt install docker
df -h
```

```
docker run -d \
  --name custom-couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=<password> \
  -v /mnt/volume_nyc1_01:/opt/couchdb/data \
  slothtopus/couchdb:dev
```
