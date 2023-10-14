# syntax=docker/dockerfile:1

FROM nginx:alpine as base
WORKDIR /app
EXPOSE 80

FROM node:alpine as build
WORKDIR /src
ARG enviroment
COPY . .
RUN yarn config set "strict-ssl" false -g
RUN yarn
RUN yarn build:$enviroment

FROM base AS final
WORKDIR /app
COPY --from=build /src/dist /usr/share/nginx/html