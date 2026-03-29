package handler

// Works の HTTP ハンドラー。役割は、HTTPリクエストを受け取り、WorksService を呼び出して処理し、HTTPレスポンスを返すことです。

import (
	"encoding/json"
	"net/http"
	"fmt"
	"strconv"
	"github.com/go-chi/chi/v5"
	"backend/src/internal/service"
)

// RankingHandler は RankingService を使って HTTP リクエストを処理します。
type RankingHandler struct {
	service *service.RankingService
}

// NewRankingHandler は RankingHandler のコンストラクタです。
func NewRankingHandler(s *service.RankingService) *RankingHandler {
	return &RankingHandler{service: s}
}

// RegisterRoutes は HTTP ハンドラーをルーティングに登録します。
func (h *RankingHandler) RegisterRoutes(r chi.Router) {
	r.HandleFunc("/ranking", h.ranking)
}

// ranking は /ranking エンドポイントの HTTP ハンドラーです。GET と POST メソッドを処理します。
func (h *RankingHandler) ranking(w http.ResponseWriter, r *http.Request) {

	    // ===== CORS 対応 =====
    w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }
    // ====================

	// HTTP メソッドによって処理を分けます。
	switch r.Method {

	// GET メソッドの場合は、RankingService の GetRankings を呼び出してランキングのリストを取得し、JSON でレスポンスを返します。
	case http.MethodGet:
		// クエリパラメータ取得
    	latest := r.URL.Query().Get("latest")
		workIDStr := r.URL.Query().Get("work_id")
		issueLabelStr := r.URL.Query().Get("issue_label")
		bestRankStr := r.URL.Query().Get("best_rank")
		worstRankStr := r.URL.Query().Get("worst_rank")
		
		// 実体の型(Ranking)は service 側で決まっているため、interface{} 型で宣言します。
		var rankings interface{}
    	var err error

		// タイトルが指定されている場合は、RankingService の GetRankingByWorkID を呼び出して作品IDに一致するランキングを取得します。
		if workIDStr != "" {
			workID, err := strconv.Atoi(workIDStr)
			if err != nil {
				http.Error(w, "invalid work_id", 400)
				return
			}
			// タイトルが指定されている場合は、RankingService の GetRankingByWorkID を呼び出して作品IDに一致するランキングを取得します。
			rankings, err := h.service.GetRankingByWorkID(r.Context(), workID)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(rankings)
			return
		}

		if issueLabelStr != "" {
			if err != nil {
				http.Error(w, "invalid issue_label", 400)
				return
			}
			// タイトルが指定されている場合は、RankingService の GetRankingByIssueLabel を呼び出して号ラベルに一致するランキングを取得します。
			rankings, err := h.service.GetRankingByIssueLabel(r.Context(), issueLabelStr)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(rankings)
			return
		}

		if bestRankStr != "" {
			workID, err := strconv.Atoi(bestRankStr)
			if err != nil {
				http.Error(w, "invalid work_id for best_rank", 400)
				return
			}
			// タイトルが指定されている場合は、RankingService の GetBestRank を呼び出して最高順位を取得します。
			bestRank, err := h.service.GetBestRank(r.Context(), workID)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]int{"best_rank": bestRank})
			return
		}

		if worstRankStr != "" {
			workID, err := strconv.Atoi(worstRankStr)
			if err != nil {
				http.Error(w, "invalid work_id for worst_rank", 400)
				return
			}
			// タイトルが指定されている場合は、RankingService の GetWorstRank を呼び出して最低順位を取得します。
			worstRank, err := h.service.GetWorstRank(r.Context(), workID)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]int{"worst_rank": worstRank})
			return
		}

		if latest == "true" {
			// 最新のランキングを取得するためのロジックをここに追加します。
			// 例えば、RankingService に GetLatestRankings という新しいメソッドを追加して呼び出すことができます。
			rankings, err = h.service.GetLatestRankings(r.Context())
		} else {
			// RankingService(service/ranking.go) の GetRankings を呼び出してランキングのリストを取得します。
			rankings, err = h.service.GetRankings(r.Context())
		}

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		// 取得したランキングのリストを JSON でレスポンスとして返します。
		w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
		w.Header().Set("Content-Type", "application/json")
		// HTTP ステータスコード 200 OK を設定します。
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(rankings)

	// POST メソッドの場合は、リクエストボディからユーザーの名前を読み取り、RankingService の CreateRanking を呼び出して新しいランキングを作成し、JSON でレスポンスを返します。
	case http.MethodPost:

		// リクエストボディから作品の名前を読み取るための構造体を定義します。
		var input struct {
			Title  string `json:"title"`
			Rank int `json:"rank_num"`
			IssueLabel string `json:"issue_label"`
		}

		// リクエストボディを JSON としてデコードします。エラーがあれば 400 Bad Request を返します。
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}

		// RankingService の CreateRanking を呼び出して新しいランキングを作成します。エラーがあれば 400 Bad Request を返します。
		rank, err := h.service.CreateRanking(r.Context(), input.Title, input.Rank, input.IssueLabel)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		// 作成したランキングを JSON でレスポンスとして返します。
		json.NewEncoder(w).Encode(rank)

	case http.MethodPut:

		type UpdateRankingRequest struct {
			IssueID  int `json:"issue_id"`
			Rankings []struct {
				WorkID int `json:"work_id"`
				Rank   int `json:"rank"`
			} `json:"rankings"`
		}
		
		var req UpdateRankingRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}

		fmt.Println("Request Body:", req.IssueID) // デバッグ用: リクエストボディの内容をログに出力します。

		if len(req.Rankings) == 0 { 
			fmt.Println("test")
			http.Error(w, "issue_id and rankings are required", 400)
			return
		}

		// service用に変換
		input := service.UpdateRankingsInput{
			IssueID: req.IssueID,
		}

		for _, ranking := range req.Rankings {
			input.Rankings = append(input.Rankings, service.RankingInput{
				WorkID: ranking.WorkID,
				Rank:   ranking.Rank,
			})
		}

		if err := h.service.UpdateRankings(r.Context(), input); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
		w.WriteHeader(http.StatusNoContent)
		

	default:
		http.Error(w, "method not allowed", 405)
	}
}
