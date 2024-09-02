FROM node:22-alpine3.19

LABEL maintainer="Alain <me@yinxulai.com>"

# 设置工作目录
WORKDIR /app

ENV API_PORT=3000
ENV DEBUG_LOG=false
ENV DATABASE_URL=postgresql://postgres:password@postgresql:5432

EXPOSE $API_PORT

# 复制项目文件
COPY . .
RUN rm -rf node_modules
RUN npm install
RUN npm run build

ENTRYPOINT ["./build/entrypoint.sh"]

# DEBUG
# ENTRYPOINT ["sleep", "infinity"]
