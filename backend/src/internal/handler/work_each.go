package handler

import (
	"encoding/json"
	"net/http"
	"github.com/go-chi/chi/v5"

	"backend/src/internal/service"
)

// WorkDetailHandler は WorksService を使って HTTP リクエストを処理します。
type WorkDetailHandler struct {
	service *service.WorksService
}

// NewWorkDetailHandler は WorkDetailHandler のコンストラクタです。
func NewWorkDetailHandler(s *service.WorksService) *WorkDetailHandler {
	return &WorkDetailHandler{service: s}
}

// RegisterRoutes は HTTP ハンドラーをルーティングに登録します。
func (h *WorkDetailHandler) RegisterRoutes(r chi.Router) {
	r.Get("/work/{title}", h.GetWorkByTitle)
}


func (h *WorkDetailHandler) GetWorkByTitle(w http.ResponseWriter, r *http.Request) {
	title := chi.URLParam(r, "title")

	work, err := h.service.GetWorkByTitle(r.Context(), title)
	if err != nil {
		http.Error(w, "work not found", http.StatusNotFound)
		return
	}


	w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(work)
}
