package main

import (
	"fmt"
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"bytes"
	//"io"
	"strings"
	//"os"
	"strconv"

	"github.com/PuerkitoBio/goquery"
)

type Volume struct {
	Title	  string   `json:"title"`
	Volume      int    `json:"volume"`
	ReleaseDate string `json:"release_date"`
	CoverImage  string `json:"coverimage"`
	Price       int    `json:"price"`
	ISBN        string `json:"isbn"`
	Description string `json:"description"`
	Pages       int    `json:"pages"`
	VolumeLink  string  `json:"volume_link"`
}

type Manga struct {
	WorkID int `json:"work_id"`
	Title  string `json:"title"`
	TitleKana string `json:"title_kana"`
	TitleEn string `json:"title_en"`
	Author string `json:"author"`
	Image  string `json:"image"`
	Story string `json:"story"`
}

type EachManga struct {
	Story string `json:"story"`
	Genre string `json:"genre"`
	Status string `json:"status"`
	EndFlg bool `json:"end_flg"`
}


func removeSpacesAndNewlines(s string) string {
	s = strings.ReplaceAll(s, " ", "")
	s = strings.ReplaceAll(s, "\n", "")
	s = strings.ReplaceAll(s, "\r", "")
	s = strings.ReplaceAll(s, "\t", "")
	return s
}

// main 関数は、ジャンプ連載作品の情報をスクレイピングして JSON ファイルに保存する処理を実装しています。
func main() {
	// 取得したいURL
	url := "https://www.shonenjump.com/j/rensai/"

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

	// 作品データ格納用スライス
	var mangaList []Manga
	// 単行本の情報格納用スライス
	var volumes []Volume

	//サイトの構造をブラウザで確認し、適切なセレクタに書き換えます。
	doc.Find(".serialSeries ul li").Each(func(i int, s *goquery.Selection) {
		raw := s.Text()
		link := s.Find("a")
		linkURL, exists := link.Attr("href")
		img := s.Find("a img")
    	imgURL, exists := img.Attr("src")
		// リンク内のテキストが作品名になる
		// テキスト部分（作品タイトル）を取り出しています。
		//』 → 作品名の閉じ括弧、(.+) → 以降すべて取得、$ → 行末まで
		re := regexp.MustCompile(`『(.*?)』(.+)`)
		match := re.FindStringSubmatch(raw)

		var title, author string

		if len(match) > 2 {
			title = match[1]
			author = match[2]
		}
		
		// 作品URLが存在する場合は、さらにそのページにアクセスして作品の詳細情報を取得します。
		work_url := "https://www.shonenjump.com" + linkURL

		resp, err := http.Get(work_url)
		if err != nil {
			log.Fatal("HTTP request error:", err)
		}
		defer resp.Body.Close()

		// ステータスコードチェック
		if resp.StatusCode != 200 {
			log.Fatalf("Status error: %d %s", resp.StatusCode, resp.Status)
		}

		doc, err := goquery.NewDocumentFromReader(resp.Body)
		if err != nil {
			log.Fatal("Error loading HTML:", err)
		}

		// 作品データ格納用スライス
		//var eachMangaList []EachManga

		//var story string
		var story2 string
		doc.Find("section.story > p").Each(func(i int, s *goquery.Selection) {
			//story = s.Text()	
			//.Println("あらすじ1: ", story)		
		})

		doc.Find("section.story p").Each(func(i int, s *goquery.Selection) {
			story2 += strings.TrimSpace(s.Text()) + "\n"
		})
		//fmt.Println("あらすじ1: ", story)
		//fmt.Println("あらすじ2: ", story2)


		/* ＝＝＝＝ 単行本の情報を取得 ＝＝＝＝ */
		var comic_url string
		doc.Find("section.comics ul > li").Each(func(i int, s *goquery.Selection) {
			//raw := s.Text()
			link := s.Find("a")
			linkURL, exists := link.Attr("href")
			re := regexp.MustCompile(`\s+`)
			re_target := regexp.MustCompile(`^list\/`)
			if re_target.MatchString(linkURL) {
				linkURL = re.ReplaceAllString(linkURL, "")
				linkURL = "https://www.shonenjump.com/j/rensai/" + linkURL
				if exists {
					comic_url = strings.Split(linkURL, "#")[0]
				}
			}
		})

		if exists {
			manga := Manga{
				WorkID: i + 1,
				Title:  title,
				TitleKana: "test"+string(rune(i+1)),
				TitleEn: "test"+string(rune(i+1)),
				Author: author,
				Story: story2,
				Image:  "https://www.shonenjump.com" + imgURL,
			}
			mangaList = append(mangaList, manga)
		}


		resp_comic, err := http.Get(comic_url)
		if err == nil {
			defer resp_comic.Body.Close()

			comicDoc, _ := goquery.NewDocumentFromReader(resp_comic.Body)
			comicDoc.Find("ul.comicsList li").Each(func(i int, s *goquery.Selection) {
				var vol Volume
				var volNum int
				// 巻数
				titleText := s.Find("dd > strong").Text()
				if titleText != "" {
					re_title := regexp.MustCompile(`【(\d+)】`)
					match := re_title.FindStringSubmatch(titleText)
					cleanTitle := re_title.ReplaceAllString(titleText, "") // 漫画のタイトル
					if len(match) > 1 {
						if match[1] != "0" {
							volNum, _ = strconv.Atoi(match[1])
							vol.Volume = volNum
							a := s.Find("a:contains('コミックスを購入')")
							href, exists := a.Attr("href")
							if exists {
								vol.VolumeLink = href
							}
							// ISBN
							//ISBN := s.Find(".comicsListBtn > li > a.redBtn").Attr("href")
							s.Find("ul.comicsListBtn a.redBtn").Each(func(i int, a *goquery.Selection) {
								// spanのテキストを取得
								text := s.Find("span").Text()
								if text == "コミックスを購入" {
									href, _ := s.Attr("href")
									//if exists {
										//fmt.Println("取得したURL:", href)
										//vol.VolumeLink = href
									//}
									// "isbn=" の後ろを取得
									parts := strings.Split(href, "isbn=")
									if len(parts) > 1 {
										isbn := parts[1]
										// & があった場合に備える
										//isbn = strings.Split(isbn, "&")[0]
										vol.ISBN = isbn
									}
								}
							})

							// 表紙画像
							imgURL, _ := s.Find("img").Attr("src")
							vol.CoverImage = imgURL
							vol.Title = cleanTitle
							//volumes = append(volumes, vol)
						}
					}
				}

				// 発売日
				//vol.ReleaseDate = s.Find(".date").Text()

				// 価格
				/**priceText := s.Find(".price").Text()
				priceText = strings.ReplaceAll(priceText, "円", "")
				priceText = strings.ReplaceAll(priceText, ",", "")
				price, _ := strconv.Atoi(priceText)
				vol.Price = price*/

				volumes = append(volumes, vol)
			})
		}


	})

	// JSONへ変換（整形付き）
	//jsonData, err := json.MarshalIndent(mangaList, "", "  ")
	//if err != nil {
		//log.Fatal(err)
	//}

	
	client := &http.Client{}


	// 1. POST処理の前に end_flg を false にする PUT リクエスト
	/**resetReq, err := http.NewRequest(
		"PUT", 
		"http://localhost:8080/works",
		nil,
	)
	if err != nil {
		log.Fatal("Failed to create PUT request:", err)
	}

	resetResp, err := client.Do(resetReq)
	if err != nil {
		log.Println("PUT error:", err)
	} else {
		defer resetResp.Body.Close()
		fmt.Printf("Initial PUT Status=%s\n", resetResp.Status)
	}*/


	// --- ここから POST 処理 ---
	var importedTitles []string
	for _, manga := range(mangaList) {
		//http.Post("http://localhost:8080/works", "application/json", strings.NewReader(string(manga)))
		// 1件だけJSONに変換
		jsonData, err := json.Marshal(manga)
		if err != nil {
			log.Println("JSON error:", err)
			continue
		}
		importedTitles = append(importedTitles, manga.Title)

		req, err := http.NewRequest(
			"POST",
			//"http://localhost:8080/works",
			"http://jump-rank-1195475384.ap-northeast-1.elb.amazonaws.com/works",
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

		//fmt.Printf("POST  Status=%s Response=%s\n",
			//resp.Status,
			//string(body),
		//)

	}

	// 1. サーバー側の struct と一致する形式でデータをラップする
	payload := struct {
		Titles []string `json:"titles"`
	}{
		Titles: importedTitles, // ここにスライスを入れる
	}
	// インポート対象になかった（＝ページから消えた）作品を終了扱いに
	//PUT
	jsonImportedTitles, err := json.Marshal(payload)
	if err != nil {
		log.Println("JSON error:", err)
		//continue
	}
	resetReq, err := http.NewRequest(
		"PUT", 
		//"http://localhost:8080/works",
		"http://jump-rank-1195475384.ap-northeast-1.elb.amazonaws.com/works",
		bytes.NewBuffer(jsonImportedTitles),
	)
	if err != nil {
		log.Fatal("Failed to create PUT request:", err)
	}
	resetReq.Header.Set("Content-Type", "application/json")


	resetResp, err := client.Do(resetReq)
	if err != nil {
		log.Println("PUT error:", err)
	} else {
		defer resetResp.Body.Close()
		fmt.Printf("Initial PUT Status=%s\n", resetResp.Status)
	}
	
    

	// 単行本の情報をPOSTする
	for _, volume := range(volumes) {
		jsonVolumeData, err := json.Marshal(volume)
		if err != nil {
			log.Println("JSON error:", err)
			continue
		}
		
		req, err := http.NewRequest(
			"POST",
			//"http://localhost:8080/volumes",
			"http://jump-rank-1195475384.ap-northeast-1.elb.amazonaws.com/volumes",
			bytes.NewBuffer(jsonVolumeData),
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

		//fmt.Printf("POST  Status=%s Response=%s\n",resp.Status,string(body),)
	}


	// ⑥ ファイルにも保存
	//file, err := os.Create("manga_rensai_list.json")
	//if err != nil {
		//log.Fatal(err)
	//}
	//defer file.Close()

	//file.Write(jsonData)

	//fmt.Println("manga_rensai_list.json に保存しました")

}
