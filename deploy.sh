# Build our Docker images
# We have to add a version so the imperative commands below will work!
# You have to tag it with latest as well so there is always a latest
# for other people to access and use
# The GIT_SHA var is set by the .travis.yml file
docker build -t mikenol/multi-client:latest -t mikenol/multi-client:$GIT_SHA -f ./client/Dockerfile ./client
docker build -t mikenol/multi-server:latest -t mikenol/multi-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t mikenol/multi-worker:latest -t mikenol/multi-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

# We are already logged in via the .travis.yml file so don't have to log in again
# Push the new images to DockerHub
docker push mikenol/multi-client:latest
docker push mikenol/multi-client:$GIT_SHA
docker push mikenol/multi-server:latest
docker push mikenol/multi-server:$GIT_SHA
docker push mikenol/multi-worker:latest
docker push mikenol/multi-worker:$GIT_SHA

# Apply all of our configs
# We already installed kubectl in the .travis.yml file
kubectl apply -f k8s

# Imperatively set the image using the tags with the SHA
kubectl set image deployments/client-deployment client=mikenol/multi-client:$GIT_SHA
kubectl set image deployments/server-deployment server=mikenol/multi-server:$GIT_SHA
kubectl set image deployments/worker-deployment worker=mikenol/multi-worker:$GIT_SHA
