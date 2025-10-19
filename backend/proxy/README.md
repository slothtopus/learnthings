# Deploying Couch Proxy with Digital Ocean

See Couch README for details on setting up Docker buildx for multi-platform builds.

Build docker image

```
docker buildx build --platform linux/amd64 -t slothtopus/couch-proxy:dev --push .
```

Set up as an App Platform app in Digital Ocean
