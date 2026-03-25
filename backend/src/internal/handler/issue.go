package handler

// Works の HTTP ハンドラー。役割は、HTTPリクエストを受け取り、WorksService を呼び出して処理し、HTTPレスポンスを返すことです。

import (
	"encoding/json"
	"net/http"
	"fmt"
	"github.com/go-chi/chi/v5"
	"backend/src/internal/service"
)

type IssueHandler struct {
	service *service.IssueService
}

func NewIssueHandler(s *service.IssueService) *IssueHandler {
	return &IssueHandler{service: s}
}

func (h *IssueHandler) RegisterRoutes(r chi.Router) {
	r.HandleFunc("/issues", h.issues)
}

func (h *IssueHandler) issues(w http.ResponseWriter, r *http.Request) {

	var Issue struct {
		IssueID   int    `json:"issue_id"`
		IssueNo   int    `json:"issue_no"`
		IssueLabel string `json:"issue_label"`
		Year      int    `json:"year"`
		ReleaseDate string `json:"release_date"`
		CoverImage  string `json:"cover_image"`
	}

	switch r.Method {
	case http.MethodGet:
		issues, err := h.service.GetIssues(r.Context())
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(issues)
		
	case http.MethodPost:
		if err := json.NewDecoder(r.Body).Decode(&Issue); err != nil {
			fmt.Println("decode error:", err) // ← エラー内容を出す
			http.Error(w, "invalid json", 400)
			return
		}

		err := h.service.PostIssues(r.Context(), Issue.IssueNo, Issue.IssueLabel, Issue.Year, Issue.ReleaseDate, Issue.CoverImage)
	
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Access-Control-Allow-Origin", "*")
		//w.Header().Set("Content-Type", "application/json")
		//json.NewEncoder(w).Encode(issue)
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"status":"ok"}`))

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}