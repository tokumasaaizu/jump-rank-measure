package service

import (
	"context"
	"errors"

	"backend/src/internal/repository"
	"backend/src/internal/model"
)

type VolumeService struct {
	repo *repository.VolumeRepository
}

func NewVolumeService(r *repository.VolumeRepository) *VolumeService {
	return &VolumeService{repo: r}
}

func (s *VolumeService) GetVolumesByWorkID(ctx context.Context, work_id int) ([]model.Volume, error) {
	return s.repo.FindVolumesByWorkID(ctx, work_id)
}

func (s *VolumeService) CreateVolumes(ctx context.Context, title string, volume int, release_date string, cover_image string, price int, isbn string, description string, pages int, volume_link string) ([]model.Volume, error) {
	var createdVolumes []model.Volume
	v := model.Volume{
		Title:       title,
		Volume:      volume,
		ReleaseDate: release_date,
		CoverImage:  cover_image,
		Price:       price,
		ISBN:        isbn,
		Description: description,
		Pages:       pages,
		VolumeLink:  volume_link,
	}
	if v.Volume <= 0 {
		return nil, errors.New("volume number must be greater than 0")
	}
	createdVolume, err := s.repo.CreateVolume(ctx, v)
	if err != nil {
		return nil, err
	}
	createdVolumes = append(createdVolumes, createdVolume)
	
	return createdVolumes, nil
}