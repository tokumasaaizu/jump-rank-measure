package handler

import (
	"encoding/json"
	"net/http"
	"github.com/go-chi/chi/v5"
	"strconv"
	"backend/src/internal/service"
	//"backend/src/internal/model"
)

type VolumeHandler struct {
	service *service.VolumeService
}

func NewVolumeHandler(s *service.VolumeService) *VolumeHandler {
	return &VolumeHandler{service: s}
}

func (h *VolumeHandler) RegisterRoutes(r chi.Router) {
	r.HandleFunc("/volumes", h.volumes)
}

func (h *VolumeHandler) volumes(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		workIDStr := r.URL.Query().Get("work_id")
		if workIDStr == "" {
			http.Error(w, "work_id is required", http.StatusBadRequest)
			return
		}

		work_id, err := strconv.Atoi(workIDStr)
		if err != nil {
			http.Error(w, "invalid work_id", http.StatusBadRequest)
			return
		}

		volumes, err := h.service.GetVolumesByWorkID(r.Context(), work_id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(volumes)

	case http.MethodPost:
		var input struct {
			Title string       `json:"title"`
			Volume      int    `json:"volume"`
			ReleaseDate string `json:"release_date"`
			CoverImage  string `json:"coverimage"`
			Price       int    `json:"price"`
			ISBN        string `json:"isbn"`
			Description string `json:"description"`
			Pages       int    `json:"pages"`
			VolumeLink  string  `json:"volume_link"`
		}
		//var v model.Volume

		err := json.NewDecoder(r.Body).Decode(&input)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		volumes, err := h.service.CreateVolumes(r.Context(), input.Title, input.Volume, input.ReleaseDate, input.CoverImage, input.Price, input.ISBN, input.Description, input.Pages, input.VolumeLink)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(volumes)
	
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}
