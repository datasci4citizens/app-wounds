# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# NEXT_PUBLIC_* vars are inlined into the static bundle at build time.
# Pass them with --build-arg; defaults point at the prod cluster backend.
ARG NEXT_PUBLIC_API_URL=https://server-wounds.ak8s.ic.unicamp.br
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# next.config.ts sets output: 'export' -> emits a static site into out/
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine AS serve

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
