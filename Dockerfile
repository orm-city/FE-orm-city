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

# Express 서버를 백그라운드에서 실행할 필요 없음 (Express는 Nginx가 프록시로 사용될 것이므로)
EXPOSE 3000

# Express 서버 실행
CMD ["node", "app.js"]