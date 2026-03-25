package service

// Works ビジネスロジック層。

import (
	"context"
	"errors"

	"backend/src/internal/repository"
	"backend/src/internal/model"
)

// WorksService は、Worksに関するビジネスロジックを提供します。
type WorksService struct {
	// UserRepository をフィールドに持ちます。これを使って DB へのアクセスを行います。
	repo *repository.WorksRepository
}

// NewWorksService は、WorksService のコンストラクタです。
func NewWorksService(r *repository.WorksRepository) *WorksService {
	// WorksService のインスタンスを作成して返します。
	return &WorksService{repo: r}
}

// GetWorks は、全ての作品を取得します。
func (s *WorksService) GetWorks(ctx context.Context) ([]repository.Work, error) {
	// WorksRepository(repository/works.go) の FindAll を呼び出して全ての作品を取得します。
	return s.repo.FindAll(ctx)
}

func (s *WorksService) GetWorkByTitle(ctx context.Context, title string) (repository.Work, error) {
	// WorksRepository(repository/works.go) の FindByTitle を呼び出してタイトルに一致する作品を取得します。
	return s.repo.FindByTitle(ctx, title)
}

// 🔥 全作品の end_flg を false にする
func (s *WorksService) UpdateEndFlog(ctx context.Context, title []string) error {
	// WorksRepository(repository/works.go) の FindByTitle を呼び出してタイトルに一致する作品を取得します。
	return s.repo.UpdateEndFlag(ctx,title)
}

// CreateWorks は、新しい作品を作成します。
func (s *WorksService) CreateWorks(ctx context.Context, work_id int, title string, title_kana string, title_en string, author string, image string, story string, volumes []model.Volume) (repository.Work, error) {

	if title == "" {
		// タイトルが空の場合はエラーを返します。
		return repository.Work{}, errors.New("title is required")
	}


	// WorksRepository(repository/works.go) の Create を呼び出して新しい作品を作成します。
	return s.repo.Create(ctx, work_id, title, title_kana, title_en, author, image, story, volumes)
}
