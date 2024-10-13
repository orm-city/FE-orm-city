# Step 1: Build the Express app
FROM node:18 AS build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# Express 앱 빌드 (필요한 경우)
#RUN npm run build

# Step 2: Setup Nginx with Express
FROM nginx:alpine

# Nginx 설정 파일 복사
COPY nginx.config /etc/nginx/conf.d/default.conf

# Express 애플리케이션 복사
COPY --from=build /app /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
