package service

// Works ビジネスロジック層。

import (
	"context"
	"errors"
	"backend/src/internal/repository"
)

	type UpdateRankingsInput struct {
	IssueID  int
	Rankings []RankingInput
	}

	type RankingInput struct {
		WorkID int
		Rank   int
	}


// RankingService は、Rankingに関するビジネスロジックを提供します。
type RankingService struct {
	// UserRepository をフィールドに持ちます。これを使って DB へのアクセスを行います。
	repo *repository.RankingRepository
}

// NewRankingService は、RankingService のコンストラクタです。
func NewRankingService(r *repository.RankingRepository) *RankingService {
	// RankingService のインスタンスを作成して返します。
	return &RankingService{repo: r}
}

// GetRankings は、全てのランキングを取得します。
func (s *RankingService) GetRankings(ctx context.Context) ([]repository.Ranking, error) {
	// RankingRepository(repository/ranking.go) の FindAllRanking を呼び出して全てのランキングを取得します。
	return s.repo.FindAllRanking(ctx)
}

// GetLatestRankings は、最新のランキングを取得します。
func (s *RankingService) GetLatestRankings(ctx context.Context) ([]repository.Ranking, error) {
	// RankingRepository(repository/ranking.go) の FindLatestRankings を呼び出して最新のランキングを取得します。
	return s.repo.FindLatestRankings(ctx)
}

func (s *RankingService) GetRankingByWorkID(ctx context.Context, workID int) ([]repository.EachRanking, error) {
	// RankingRepository(repository/ranking.go) の FindByWorkID を呼び出して作品IDに一致するランキングを取得します。
	return s.repo.FindByWorkID(ctx, workID)
}

func (s *RankingService) GetRankingByIssueLabel(ctx context.Context, issueLabelStr string) ([]repository.Ranking, error) {
	// RankingRepository(repository/ranking.go) の FindRankingByIssueLabel を呼び出して号ラベルに一致するランキングを取得します。
	return s.repo.FindRankingByIssueLabel(ctx, issueLabelStr)
}

// 最高順位を取得
func (s *RankingService) GetBestRank(ctx context.Context, workID int) (int, error) {
	return s.repo.FindBestRankByWorkID(ctx, workID)
}

// 最低順位を取得
func (s *RankingService) GetWorstRank(ctx context.Context, workID int) (int, error) {
	return s.repo.FindWorstRankByWorkID(ctx, workID)
}

// CreateRanking は、新しいランキングを作成します。
func (s *RankingService) CreateRanking(ctx context.Context, title string, rank int, issueLabel string) (repository.Ranking, error) {

	if title == "" {
		// タイトルが空の場合はエラーを返します。
		return repository.Ranking{}, errors.New("title is required")
	}
	if rank < 0 {
		// ランキングが1未満の場合はエラーを返します。
		return repository.Ranking{}, errors.New("rank must be greater than 0")
	}

	// 前号の順位を知る
	currentBest, err := s.repo.GetPastRank(ctx, title)
		if err != nil {
			// エラーハンドリング（未登録作品の場合はデフォルト値を設定するなど）
			return repository.Ranking{}, errors.New("no best rank")
		}
	
	// 今回の順位がこれまでの記録より「数字が小さい（＝順位が高い）」か判定
    isNewRecord := false
    if rank < currentBest || currentBest == 0 {
        isNewRecord = true
    }


	// ランキング作成（txを渡す）。RankingRepository(repository/ranking.go) の Create を呼び出して新しいランキングを作成します。
    ranking, err := s.repo.Create(ctx, title, rank, issueLabel, isNewRecord)
    if err != nil {
        return repository.Ranking{}, err
    }
	
	// 最高・最低順位の更新（txを渡す）
    if err := s.repo.UpdateSeriesBestWorst(ctx, title, rank); err != nil {
        return repository.Ranking{}, err
    }

	// 一度全てのkyusai_flgをfalseに
	if err := s.repo.ResetKyusaiFlag(ctx); err != nil {
		return repository.Ranking{}, err
	}

	// 休載情報の更新
	if err := s.repo.UpdateKyusaiWorst(ctx); err != nil {
		return repository.Ranking{}, err
	}


	//return s.repo.Create(ctx, title, rank, issueLabel)
	return ranking, nil
}


// 管理者による更新
func (s *RankingService) UpdateRankings(ctx context.Context, req UpdateRankingsInput) error {

	var updates []repository.RankingUpdate

	for _, r := range req.Rankings {
		updates = append(updates, repository.RankingUpdate{
			WorkID: r.WorkID,
			Rank:   r.Rank,
		})
	}

		// 重複順位チェック（安全対策）
	/**rankMap := make(map[int]bool)
	for _, r := range input.Rankings {
		if rankMap[r.Rank] {
			return fmt.Errorf("duplicate rank detected")
		}
		rankMap[r.Rank] = true
	}*/

	return s.repo.UpdateRankings(ctx, req.IssueID, updates)
}