package repository

// works DB へのアクセス層。


import (
	"context"
	"time"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	//"backend/src/internal/model"
)


type Issue struct {
	ID        int       `json:"id"`
	IssueID   int       `json:"issue_id"`
	IssueNo   int       `json:"issue_no"`
	IssueLabel string    `json:"issue_label"`
	Year      int       `json:"year"`
	ReleaseDate string   `json:"release_date"`
	CoverImage  string   `json:"cover_image"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type IssueRepository struct {
	pool *pgxpool.Pool
}

func NewIssueRepository(pool *pgxpool.Pool) *IssueRepository {
	return &IssueRepository{pool: pool}
}

func (r *IssueRepository) PostIssues(ctx context.Context, issueNo int, issueLabel string, year int, releaseDate string, coverImage string) error {
	//var i []Issue

	fmt.Printf("Creating issue: IssueNo=%d, IssueLabel=%s, Year=%d, ReleaseDate=%s, CoverImage=%s\n",
		issueNo, issueLabel, year, releaseDate, coverImage)

	_, err := r.pool.Exec(ctx,
		`INSERT INTO issues (issue_no, issue_label, year, release_date, cover_image)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (issue_label) DO NOTHING`,
		issueNo, issueLabel, year, releaseDate, coverImage,
	)
	return err
}

// 最新号から5号前まで取得
func (r *IssueRepository) FindAll(ctx context.Context) ([]Issue, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT issue_id, issue_no, issue_label
		 FROM issues ORDER BY issue_id DESC LIMIT 5`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var issues []Issue
	for rows.Next() {
		var i Issue
		if err := rows.Scan(&i.IssueID, &i.IssueNo, &i.IssueLabel); err != nil {
			return nil, err
		}
		issues = append(issues, i)
	}
	return issues, rows.Err()
}