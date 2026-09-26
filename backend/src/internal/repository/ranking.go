package repository

// works DB へのアクセス層。

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Ranking struct {
	RankingID  int       `json:"ranking_id"`
	WorkID     int       `json:"work_id"`
	Title      string    `json:"title"`
	IssueID    int       `json:"issue_id"`
	IssueLabel string    `json:"issue_label"`
	Rank       int       `json:"rank_num"`
	//RankChange int       `json:"rank_change"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	RankChange *bool      `json:"rank_change"`
}

type EachRanking struct {
	RankingID  int    `json:"ranking_id"`
	WorkID     int    `json:"work_id"`
	IssueID    int    `json:"issue_id"`
	IssueLabel string `json:"issue_label"`
	Rank       int    `json:"rank_num"`
	RankChange *bool    `json:"rank_change"`
}

type RankingUpdate struct {
	WorkID int
	Rank   int
}

type RankingInput struct {
	WorkID int
	Rank   int
}

type RankingRepository struct {
	pool *pgxpool.Pool
}

func NewRankingRepository(pool *pgxpool.Pool) *RankingRepository {
	return &RankingRepository{pool: pool}
}

// FindAllRanking は、全てのランキングを取得します。
func (r *RankingRepository) FindAllRanking(ctx context.Context) ([]Ranking, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT i.issue_label, w.title, r.rank_num 
		 FROM ranking r 
		 JOIN issues i ON r.issue_id = i.issue_id 
		 JOIN works w ON r.work_id = w.work_id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rankings []Ranking

	for rows.Next() {
		var r Ranking
		if err := rows.Scan(&r.IssueLabel, &r.Title, &r.Rank); err != nil {
			return nil, err
		}
		rankings = append(rankings, r)
	}
	return rankings, rows.Err()
}

func (r *RankingRepository) FindRankingByIssueLabel(ctx context.Context, issueLabelStr string) ([]Ranking, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT i.issue_label, w.title, r.rank_num 
		 FROM ranking r 
		 JOIN issues i ON r.issue_id = i.issue_id 
		 JOIN works w ON r.work_id = w.work_id
		 WHERE i.issue_label = $1
		 ORDER BY rank_num`, issueLabelStr)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rankings []Ranking

	for rows.Next() {
		var r Ranking
		if err := rows.Scan(&r.IssueLabel, &r.Title, &r.Rank); err != nil {
			return nil, err
		}
		rankings = append(rankings, r)
	}
	return rankings, rows.Err()
}

// FindLatestRankings は、最新のランキングを取得します。
func (r *RankingRepository) FindLatestRankings(ctx context.Context) ([]Ranking, error) {

	rows, err := r.pool.Query(ctx,
		`SELECT i.issue_label, i.issue_id, w.title, r.rank_num, r.work_id
		 FROM ranking r 
		 JOIN issues i ON r.issue_id = i.issue_id 
		 JOIN works w ON r.work_id = w.work_id
		 WHERE r.issue_id = (select issue_id from issues ORDER BY issue_id DESC LIMIT 1)`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rankings []Ranking

	for rows.Next() {
		var r Ranking
		if err := rows.Scan(&r.IssueLabel, &r.IssueID, &r.Title, &r.Rank, &r.WorkID); err != nil {
			return nil, err
		}
		rankings = append(rankings, r)
	}
	return rankings, rows.Err()
}


func (r *RankingRepository) FindByWorkID(ctx context.Context, workID int) ([]EachRanking, error) {

	rows, err := r.pool.Query(ctx,
		`SELECT r.ranking_id, r.work_id, r.issue_id, i.issue_label, r.rank_num, r.rank_change
		 FROM ranking r
		 JOIN issues i ON r.issue_id = i.issue_id
		 WHERE work_id = $1
		 ORDER BY r.created_at DESC`, workID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rankings []EachRanking

	for rows.Next() {
		var r EachRanking
		if err := rows.Scan(&r.RankingID, &r.WorkID, &r.IssueID, &r.IssueLabel, &r.Rank, &r.RankChange); err != nil {
			return nil, err
		}
		rankings = append(rankings, r)
	}

	return rankings, rows.Err()
}

// 最高順位を取得
func (r *RankingRepository) FindBestRankByWorkID(ctx context.Context, workID int) (int, error) {

	var bestRank int
	err := r.pool.QueryRow(ctx,
		`SELECT MIN(rank_num) 
		 FROM ranking 
		 WHERE work_id = $1`, workID,
	).Scan(&bestRank)

	return bestRank, err
}

// 最低順位を取得
func (r *RankingRepository) FindWorstRankByWorkID(ctx context.Context, workID int) (int, error) {

	var worstRank int
	err := r.pool.QueryRow(ctx,
		`SELECT MAX(rank_num) 
		 FROM ranking 
		 WHERE work_id = $1`, workID,
	).Scan(&worstRank)

	return worstRank, err
}

// 特定の作品の今の順位を取得
func (r *RankingRepository) GetPastRank(ctx context.Context, title string) (int, error) {
	
	var rankNow int
	// prev_rank を更新する
	err := r.pool.QueryRow(ctx,
		`SELECT r.rank_num
		 FROM ranking r
		 JOIN issues i ON r.issue_id = i.issue_id
		 WHERE work_id = (SELECT work_id FROM works WHERE title = $1)
		 ORDER BY r.issue_id DESC LIMIT 1`, title,
	).Scan(&rankNow)
	// まだ一度も順位が登録されていない作品は 0 を返す
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, nil
	}
	/**
	err := r.pool.QueryRow(ctx,
		`UPDATE ranking
			SET prev_rank = rank_num
			WHERE work_id = (SELECT work_id FROM works WHERE title = $1)`, title,
	).Scan(&rankNow)
	*/
	return rankNow, err
}

// 最高・最低順位の更新
func (r *RankingRepository) UpdateSeriesBestWorst(ctx context.Context, title string, rank int) error {
	fmt.Println("update ranking with title:", title, "rank:", rank)
	_, err := r.pool.Exec(ctx,
		`UPDATE works
			SET peak_rank = (SELECT MIN(rank_num) FROM ranking WHERE work_id = (SELECT work_id FROM works WHERE title = $1)),
			worst_rank = (SELECT MAX(rank_num) FROM ranking WHERE work_id = (SELECT work_id FROM works WHERE title = $1))
			WHERE work_id = (SELECT work_id FROM works WHERE title = $1)`,
		title,
	)
	return err
}

// 連載中の作品の kyusai_flg を false にします。
func (r *RankingRepository) ResetKyusaiFlag(ctx context.Context) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE works
		SET kyusai_flg = false
		WHERE end_flg = false
	`)
	return err
}

// 休載情報の更新(今週のランキング数値が無い作品のkyusai_flgをtrueに)
func (r *RankingRepository) UpdateKyusaiWorst(ctx context.Context) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE works w
			SET kyusai_flg = true
			WHERE w.end_flg = false
			AND NOT EXISTS (
				SELECT 1
				FROM ranking r
				WHERE r.work_id = w.work_id AND r.issue_id = (SELECT issue_id FROM issues ORDER BY issue_id DESC LIMIT 1)
			)`)
	return err
}



// Create は、新しいランキングを作成します。
func (r *RankingRepository) Create(ctx context.Context, title string, rank int, issueLabel string, isNewRecord bool) (Ranking, error) {

	var newRanking Ranking
	fmt.Println("Creating ranking with title:", title, "rank:", rank, "issueLabel:", issueLabel)

	err := r.pool.QueryRow(ctx,
		`INSERT INTO ranking (work_id, rank_num, issue_id, rank_change)
		VALUES (
			(SELECT work_id FROM works WHERE title = $1),
			$2,
			(SELECT issue_id FROM issues WHERE issue_label LIKE '%' || $3 || '%'),
			$4
		)
		RETURNING ranking_id, work_id, issue_id, rank_num, created_at, rank_change`,
		title, rank, issueLabel, isNewRecord,
	).Scan(
		&newRanking.RankingID,
		&newRanking.WorkID,
		&newRanking.IssueID,
		&newRanking.Rank,
		&newRanking.CreatedAt,
		&newRanking.RankChange,
	)

	return newRanking, err

}

// 管理者権限による順位変更処理
func (r *RankingRepository) UpdateRankings(ctx context.Context, issueID int, rankings []RankingUpdate) error {

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for _, r := range rankings {
		_, err := tx.Exec(ctx, `
			UPDATE ranking
			SET rank_num = $1
			WHERE issue_id = $2
			AND work_id = $3
		`, r.Rank, issueID, r.WorkID)
		if err != nil {
			return err
		}
	}

	// トランザクションをコミットします。
	return tx.Commit(ctx)

}
