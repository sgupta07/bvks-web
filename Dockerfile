FROM --platform=amd64 node:16-alpine as builder

WORKDIR /app

COPY ./ .
RUN npm ci --legacy-peer-deps --production=false \
  && npm run build

FROM --platform=amd64 node:16-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY ./ .

RUN npm ci --legacy-peer-deps --production=true

EXPOSE 3000
CMD npm run serve
