# DigitalOcean App Platform sets PORT (often 8080). Bind to 0.0.0.0.
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node package.json server.js ./

USER node

EXPOSE 8080

CMD ["node", "server.js"]
