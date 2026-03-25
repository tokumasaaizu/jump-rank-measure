package repository
// works DB へのアクセス層。

import (
	"context"
	"time"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"backend/src/internal/model"
)

// Works は、works テーブルのレコードを表す構造体です。
// 小文字始まり → 非公開になるので注意。公開したい場合は大文字始まりにする必要があります。
type Work struct {
	ID                     int       `json:"id"`
	WorkID				 int       `json:"work_id"`
	Title                  string    `json:"title"`
	TitleKana              string    `json:"title_kana"`
	TitleEn               string    `json:"title_en"`
	Author                 string    `json:"author"`
	SerializationStartDate time.Time `json:"serialization_start_date"`
	EndFlg                 bool      `json:"end_flg"`
	KyusaiFlg              bool      `json:"kyusai_flg"`
	Story                  string    `json:"story"`
	Genre                  string    `json:"genre"`
	CreatedAt              time.Time `json:"created_at"`
	UpdatedAt              time.Time `json:"updated_at"`
	PeakRank               int       `json:"peak_rank"`
	Status                 string    `json:"status"`
	ImageURL               string    `json:"image_url"`
	OfficialURL            string    `json:"official_url"`
	//Volumes                []Volume  `json:"volumes"`
	Volumes 			[]model.Volume `json:"volumes"`
}


type WorksRepository struct {
	pool *pgxpool.Pool
}

func NewWorksRepository(pool *pgxpool.Pool) *WorksRepository {
	return &WorksRepository{pool: pool}
}

func (r *WorksRepository) FindAll(ctx context.Context) ([]Work, error) {

	rows, err := r.pool.Query(ctx,
		`SELECT work_id, title, author, image_url, created_at
		 FROM works
		 ORDER BY work_id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var works []Work

	for rows.Next() {
		var w Work
		if err := rows.Scan(&w.ID, &w.Title, &w.Author, &w.ImageURL, &w.CreatedAt); err != nil {
			return nil, err
		}
		works = append(works, w)
	}
	return works, rows.Err()
}

func (r *WorksRepository) FindByTitle(ctx context.Context, title string) (Work, error) {
	var w Work
	err := r.pool.QueryRow(ctx,
		`SELECT work_id, title, author, image_url, story, end_flg, kyusai_flg, created_at
		 FROM works
		 WHERE title = $1`, title,
	).Scan(&w.WorkID, &w.Title, &w.Author, &w.ImageURL, &w.Story, &w.EndFlg, &w.KyusaiFlg, &w.CreatedAt)
	return w, err
}


// インポート対象になかった（＝ページから消えた）作品を終了扱いに
func (r *WorksRepository) UpdateEndFlag(ctx context.Context, importedTitles []string) error {
	// "title != ALL($1)" は、スライス内のどの要素とも一致しないことを意味します
	query := `
		UPDATE works
		SET 
			end_flg = true,
			updated_at = NOW()
		WHERE 
			end_flg = false
			AND title != ALL($1)
	`

	// pgxやdatabase/sqlのスライス渡しの対応状況により、
	// lib/pqなどを使用している場合は pq.Array(importedTitles) が必要になる場合があります
	_, err := r.pool.Exec(ctx, query, importedTitles)
	if err != nil {
		return fmt.Errorf("failed to update finished works: %w", err)
	}

	return err
}


func (r *WorksRepository) Create(ctx context.Context, work_id int,title string, 
	title_kana string, title_en string, author string, image_url string, story string, volumes []model.Volume) (Work, error) {

	var w Work
	//var vol []model.Volume

	//r.pool.Exec(ctx, `UPDATE works SET end_flg = false WHERE work_id = $1`, work_id)

	r.pool.Exec(ctx,
		`UPDATE works
			SET story = $1
			WHERE work_id = $2`,
		story,work_id,
	)

	fmt.Println("create : ", work_id, title, story)

	// すでに同じタイトルの作品が存在する場合は INSERT をスキップする( ON CONFLICT (title) DO NOTHING の部分)
	err := r.pool.QueryRow(ctx,
		`INSERT INTO works (work_id, title, title_kana, title_en, author, image_url, story, end_flg)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, false)
		 ON CONFLICT (title) DO NOTHING
		 RETURNING work_id, title, title_kana, title_en, author, image_url, story, created_at`,
		work_id, title, title_kana, title_en, author, image_url, story,
	).Scan(&w.WorkID, &w.Title, &w.TitleKana, &w.TitleEn, &w.Author, &w.ImageURL, &w.Story, &w.CreatedAt)
	

	// すでに同じタイトルの作品x巻数が存在する場合は、INSERT をスキップする( ON CONFLICT (work_id, volume) DO NOTHING の部分)
	/**for _, v := range volumes {	
		err = r.pool.QueryRow(ctx,
			`INSERT INTO volumes (work_id, volume, release_date, coverimage, price, isbn, description, pages)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 ON CONFLICT (work_id, volume) DO NOTHING
			 RETURNING volume, release_date, coverimage, price, isbn, description, pages`,
			work_id, v.Volume, v.ReleaseDate, v.CoverImage, v.Price, v.ISBN, v.Description, v.Pages,
		).Scan(&v.Volume, &v.ReleaseDate, &v.CoverImage, &v.Price, &v.ISBN, &v.Description, &v.Pages)

		w.Volumes = append(w.Volumes, v)
	}*/

	return w, err

}


