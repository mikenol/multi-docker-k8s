# Use an existing docker image as a base
# This is the alpine (stripped down) version with just node installed

# This doesn't work with AWS Elastic Beanstalk, we get this error
# "docker pull" requires exactly 1 argument
# The quick fix will be to use an unnamed builder, rather than a named builder:
# By default, the stages are not named, and you refer to them by their integer
# number, starting with 0 for the first FROM instruction.
#FROM node:alpine as builder
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

# Build it
RUN npm run build

# End build phase

# Start run phase

FROM nginx
EXPOSE 3000

# Copy the build directory from npm run build to the nginx dir
# This doesn't work with AWS Elastic Beanstalk, we get this error
# "docker pull" requires exactly 1 argument
# The quick fix will be to use an unnamed builder, rather than a named builder:
# By default, the stages are not named, and you refer to them by their integer
# number, starting with 0 for the first FROM instruction.
#COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=0 /app/build /usr/share/nginx/html

# Copy the nginx configuration file to the image
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# End run phase

