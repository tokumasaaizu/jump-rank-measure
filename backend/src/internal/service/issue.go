package service

// Works ビジネスロジック層。

import (
	"context"
	"errors"
	"backend/src/internal/repository"
	//"backend/src/internal/model"
)

type IssueService struct {
	repo *repository.IssueRepository
}

func NewIssueService(r *repository.IssueRepository) *IssueService {
	return &IssueService{repo: r}
}

func (s *IssueService) GetIssues(ctx context.Context) ([]repository.Issue, error) {
	return s.repo.FindAll(ctx)
}

func (s *IssueService) PostIssues(
	ctx context.Context,issueNo int,issueLabel string,year int,releaseDate string,coverImage string,
) error {
	if issueLabel == "" {
		return errors.New("issue_label is required")
	}

	return s.repo.PostIssues(
		ctx,
		issueNo,
		issueLabel,
		year,
		releaseDate,
		coverImage,
	)
}