package repository

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"backend/src/internal/model"
)

type VolumeRepository struct {
	pool *pgxpool.Pool
}

func NewVolumeRepository(pool *pgxpool.Pool) *VolumeRepository {
	return &VolumeRepository{pool: pool}
}


func (r *VolumeRepository) FindVolumesByWorkID(ctx context.Context, work_id int) ([]model.Volume, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT volume, release_date, coverimage, price, isbn, description, pages, volume_link
		 FROM volumes WHERE work_id = $1`, work_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var volumes []model.Volume
	for rows.Next() {
		var v model.Volume
		err := rows.Scan(&v.Volume, &v.ReleaseDate, &v.CoverImage, &v.Price, &v.ISBN, &v.Description, &v.Pages, &v.VolumeLink)
		if err != nil {
			return nil, err
		}
		volumes = append(volumes, v)
	}
	return volumes, rows.Err()
}


func (r *VolumeRepository) CreateVolume(ctx context.Context, v model.Volume) (model.Volume, error) {
	var createdVolume model.Volume

	err := r.pool.QueryRow(ctx,
		`INSERT INTO volumes (work_id, volume, release_date, coverimage, price, isbn, description, pages, volume_link)
		 VALUES (
		 (SELECT work_id FROM works WHERE title LIKE '%' || $1 || '%'), 
		 $2, $3, $4, $5, $6, $7, $8, $9)
		 ON CONFLICT (work_id, volume) DO NOTHING
		 RETURNING volume, release_date, coverimage, price, isbn, description, pages`,
		v.Title, v.Volume, v.ReleaseDate, v.CoverImage, v.Price, v.ISBN, v.Description, v.Pages, v.VolumeLink,
	).Scan(&createdVolume.Volume, &createdVolume.ReleaseDate, &createdVolume.CoverImage,
		&createdVolume.Price, &createdVolume.ISBN, &createdVolume.Description, &createdVolume.Pages, &createdVolume.VolumeLink)
	if err != nil {
		return model.Volume{}, err
	}
	return createdVolume, nil
}