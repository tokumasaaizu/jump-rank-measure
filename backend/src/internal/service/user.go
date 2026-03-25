package service

// User ビジネスロジック層。
// ここでは、ユーザに関するビジネスロジックを実装します。主に、リクエストのバリデーションや、複数のリポジトリを組み合わせた処理などを行います。

import (
	"context"
	"errors"

	"backend/src/internal/repository"
)

// UserService は、ユーザに関するビジネスロジックを提供します。
type UserService struct {
	// UserRepository をフィールドに持ちます。これを使って DB へのアクセスを行います。
	repo *repository.UserRepository
}

// NewUserService は、UserService のコンストラクタです。
func NewUserService(r *repository.UserRepository) *UserService {
	// UserService のインスタンスを作成して返します。
	return &UserService{repo: r}
}

// GetUsers は、全てのユーザを取得します。
func (s *UserService) GetUsers(ctx context.Context) ([]repository.User, error) {
	// UserRepository(repository/user.go) の FindAll を呼び出して全てのユーザを取得します。
	return s.repo.FindAll(ctx)
}

// CreateUser は、新しいユーザを作成します。
func (s *UserService) CreateUser(ctx context.Context, name string) (repository.User, error) {

	if name == "" {
		// 名前が空の場合はエラーを返します。
		return repository.User{}, errors.New("name is required")
	}

	// UserRepository(repository/user.go) の Create を呼び出して新しいユーザを作成します。
	return s.repo.Create(ctx, name)
}
