# --- Build Stage ---
FROM golang:1.26-alpine AS builder

# ビルドに必要な最小限のパッケージをインストール（CGOを使う場合などは gcc 等が必要）
RUN apk add --no-cache git

WORKDIR /app

# 先に依存関係をコピーしてキャッシュを効かせる
COPY go.mod go.sum ./
RUN go mod download

# ソースコード全体をコピー
COPY . .

# src/api/main.go をビルドして 'main' という名前のバイナリを出力
# CGO_ENABLED=0 にすることで、OSに依存しない静的バイナリを作成（ECS/Fargateで必須）
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/main ./src/api/main.go

# --- Run Stage ---
FROM alpine:latest
RUN apk add --no-cache ca-certificates wget
WORKDIR /app

RUN wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O global-bundle.pem

# ビルダーステージからバイナリだけをコピー
COPY --from=builder /app/main .

# アプリが使用するポート（Reactから接続するポート）
EXPOSE 8080

# アプリを実行
CMD ["./main"]
