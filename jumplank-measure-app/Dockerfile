FROM node:18.16.0-alpine
WORKDIR /Users/tokutake/Desktop/my_app/jump-rank-measure 
# 依存関係だけコピーしてインストール
COPY package.json package-lock.json ./
RUN npm install
# Chart.jsを事前に入れておくなら
RUN npm install recharts chart.js react-chartjs-2
# その後にアプリのソースコードをコピー
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
