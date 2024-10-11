# Step 1: Node.js 베이스 이미지 사용
FROM node:14-alpine

# Step 2: 앱 디렉토리 생성
WORKDIR /usr/src/app

# Step 3: 패키지 설치
COPY package*.json ./
RUN npm install --production

# Step 4: 애플리케이션 파일 복사
COPY . .

# Step 5: 포트 노출
EXPOSE 3000

# Step 6: 애플리케이션 시작
CMD ["node", "app.js"]
