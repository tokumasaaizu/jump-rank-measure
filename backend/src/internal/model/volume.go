package model

//import "time"

type Volume struct {
	Title      string    `json:"title"`
	Volume      int       `json:"volume"`
	ReleaseDate string    `json:"release_date"`
	CoverImage  string    `json:"coverimage"`
	Price       int       `json:"price"`
	ISBN        string    `json:"isbn"`
	Description string    `json:"description"`
	Pages       int       `json:"pages"`
	VolumeLink  string  `json:"volume_link"`
}