# syntax=docker/dockerfile:1

FROM nginx:alpine as base
WORKDIR /app
EXPOSE 80

FROM node:alpine as build
WORKDIR /src
ARG environment
COPY . .
RUN yarn config set "strict-ssl" false -g
RUN yarn
RUN yarn build:$environment

FROM base AS final
WORKDIR /app
COPY --from=build /src/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf