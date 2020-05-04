# Use an existing docker image as a base
# This is the alpine (stripped down) version with just node installed
FROM node:alpine

# Set the  workdir dir inside the image
WORKDIR /app

# Copy just the package.json into the image
COPY ./package.json ./

# Download and install a dependency
RUN npm install

# Copy the rest
# This will prevent you from having to rerun npm install
# when you change any other file
COPY . .

# Tell the image what to do when it starts as a container
CMD ["npm", "run", "start"]

