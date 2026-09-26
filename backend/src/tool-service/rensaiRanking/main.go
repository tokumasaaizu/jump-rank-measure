package main

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"encoding/json"
	"bytes"
	"strconv"
	"io"
	"os"
	"strings"
	"github.com/PuerkitoBio/goquery"
)

type Manga struct {
	Rank int    `json:"rank_num"`
	Title  string `json:"title"`
	IssueLabel string `json:"issue_label"`
}

type Issue struct {
	IssueID   int    `json:"issue_id"`
	IssueNo   int    `json:"issue_no"`
	IssueLabel string `json:"issue_label"`
	Year      int    `json:"year"`
	ReleaseDate string `json:"release_date"`
	CoverImage  string `json:"cover_image"`
}

// Discord通知用の構造体
type DiscordPayload struct {
	Content string `json:"content"`
}

// Discordに通知を送る関数
func sendDiscordNotification(webhookURL, message string) {
	if webhookURL == "" {
		log.Println("Discord Webhook URL is empty. Skipping notification.")
		return
	}

	payload := DiscordPayload{Content: message}
	jsonPayload, _ := json.Marshal(payload)

	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Printf("Discord notification error: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		log.Printf("Discord returned non-204 status: %s\n", resp.Status)
	}
}


// 作品順位を取得するためのコードです。以下の手順で実装しています。
func main() {
	// 通知先のDiscord
	webhookURL := getenv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/xxxx")
	// 送信先の API (ローカルでは API_BASE_URL=http://localhost:8080)
	apiBaseURL := getenv("API_BASE_URL", "http://xxx(AWS ALB)")
	// 取得したいURL
	url := "https://www.shonenjump.com/j/weeklyshonenjump/"

	// ① HTTPでページを取得(HTTP GETリクエスト)
	//まず対象ページに GET リクエストを送っています。エラー処理を忘れないようにします。
	resp, err := http.Get(url)
	if err != nil {
		log.Fatal("HTTP request error:", err)
	}
	defer resp.Body.Close()

	// ステータスコードチェック
	if resp.StatusCode != 200 {
		log.Fatalf("Status error: %d %s", resp.StatusCode, resp.Status)
	}

	// ② HTMLをgoqueryでロード(HTMLパース)
	// レスポンスボディをHTMLとして解析し、goqueryドキュメントとして読み込みます。
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		log.Fatal("Error loading HTML:", err)
	}

	// 号数を取得
	var issue_label string
	var img_url string
	doc.Find(".wrapper article div div ul").Each(func(i int, s *goquery.Selection) {
		text := s.Find("p").Text()
		img_url = s.Find("img").AttrOr("src", "")
		issue_label = strings.ReplaceAll(text, "表紙", "")
		re := regexp.MustCompile(`\s+`)
		issue_label = re.ReplaceAllString(issue_label, "")
		
	})


	re_issue := regexp.MustCompile(`^(\d+)年(\d+)号$`)
	matches := re_issue.FindStringSubmatch(issue_label)
	if len(matches) != 3 {
		fmt.Println("形式が不正です")
		return
	}
	year, _ := strconv.Atoi(matches[1])
	issue_no, _ := strconv.Atoi(matches[2])

	issue_te := Issue{
		IssueNo:     issue_no,
		IssueLabel:  issue_label,
		Year:        year,
		ReleaseDate: "2026-03-01",
		CoverImage:  "https://www.shonenjump.com/j/weeklyshonenjump/"+img_url,
	}
	

	// 作品データ格納用スライス
	var mangaList []Manga
	rank := 1
	//サイトの構造をブラウザで確認し、適切なセレクタに書き換えます。
	doc.Find(".rensaiAll ul li dl dd").Each(func(i int, s *goquery.Selection) {
		desc := s.Find(".read").Text()
		// 読切作品を抽出
		re := regexp.MustCompile(`読切`)
		match := re.FindStringSubmatch(desc)
		title := s.Find(".ttl").Text()
		// 読切作品を除く
		if match == nil {
			mangaList = append(mangaList, Manga{
				Rank: rank,
				Title:  title,
				IssueLabel: issue_label,
			})
			rank++ // ここで順位を詰める
		} 
	})

	client := &http.Client{}


	// 雑誌号数
	issueListJson, err := json.Marshal(issue_te)
	if err != nil {
		log.Println("JSON error:", err)
		return
	}
	req_issue, err := http.NewRequest(
			"POST",
			apiBaseURL+"/issues",
			bytes.NewBuffer(issueListJson),
		)
		if err != nil {
			log.Println("Request error:", err)
			return
		}

		req_issue.Header.Set("Content-Type", "application/json")

		resp_issue, err := client.Do(req_issue)
		if err != nil {
			log.Println("POST error:", err)
			return
		}

		body, _ := io.ReadAll(resp_issue.Body)
		resp_issue.Body.Close()

		fmt.Printf("POST  Status=%s Response=%s\n",
			resp_issue.Status,
			string(body),
		)
	

	for _, manga := range(mangaList) {
		// 1件だけJSONに変換
		jsonData, err := json.Marshal(manga)
		if err != nil {
			log.Println("JSON error:", err)
			continue
		}

		req, err := http.NewRequest(
			"POST",
			apiBaseURL+"/ranking",
			bytes.NewBuffer(jsonData),
		)
		if err != nil {
			log.Println("Request error:", err)
			continue
		}

		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			log.Println("POST error:", err)
			continue
		}

		//body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

	}

	// --- 全工程終了後にDiscordへ通知 ---
	notificationMsg := fmt.Sprintf("🤖 **連載順位をアプリに反映完了**\n対象: %s\nURL: https://jump-rank.toma39blog.com/jumprank/home\nステータス: 正常終了", issue_label)
	sendDiscordNotification(webhookURL, notificationMsg)

}

// getenv は環境変数 key の値を返します。未設定なら fallback を返します。
func getenv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}
