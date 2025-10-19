# Learnthings backend

Currently designed to be deployed on the cheapest Digital Ocean droplet I can get away with.

## Setting up the server

The steps for setting up the server ready for deploy are. This only needs to be done once for a new droplet.

### Install docker compose

Install docker compose (taken from https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)

```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```


### Mount the volume

Check digital ocean console for volume name.

```
mkdir -p /mnt/volume_sfo2_01
mount -o discard,defaults,noatime /dev/disk/by-id/scsi-0DO_Volume_volume-sfo2-01 /mnt/volume_sfo2_01
```

## Deploying the backend

