FROM nginx:alpine

# Nginx 설정 파일 복사
COPY ./nginx.config /etc/nginx/conf.d/default.conf

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]
