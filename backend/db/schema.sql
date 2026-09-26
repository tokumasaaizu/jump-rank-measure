-- ローカル開発用スキーマ。
-- repository/*.go の SQL から逆算したもので、本番 RDS の定義とは細部が異なる可能性があります。

CREATE TABLE IF NOT EXISTS works (
    id                       SERIAL PRIMARY KEY,
    work_id                  INTEGER NOT NULL,
    title                    TEXT NOT NULL UNIQUE,
    title_kana               TEXT NOT NULL DEFAULT '',
    title_en                 TEXT NOT NULL DEFAULT '',
    author                   TEXT NOT NULL DEFAULT '',
    image_url                TEXT NOT NULL DEFAULT '',
    story                    TEXT NOT NULL DEFAULT '',
    genre                    TEXT NOT NULL DEFAULT '',
    status                   TEXT NOT NULL DEFAULT '',
    official_url             TEXT NOT NULL DEFAULT '',
    serialization_start_date DATE,
    end_flg                  BOOLEAN NOT NULL DEFAULT false,
    kyusai_flg               BOOLEAN NOT NULL DEFAULT false,
    peak_rank                INTEGER,
    worst_rank               INTEGER,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
    issue_id     SERIAL PRIMARY KEY,
    issue_no     INTEGER NOT NULL,
    issue_label  TEXT NOT NULL UNIQUE,
    year         INTEGER NOT NULL,
    release_date DATE,
    cover_image  TEXT NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ranking (
    ranking_id  SERIAL PRIMARY KEY,
    work_id     INTEGER NOT NULL,
    issue_id    INTEGER NOT NULL,
    rank_num    INTEGER NOT NULL,
    rank_change BOOLEAN,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volumes (
    volume_id    SERIAL PRIMARY KEY,
    work_id      INTEGER NOT NULL,
    volume       INTEGER NOT NULL,
    release_date TEXT NOT NULL DEFAULT '',
    coverimage   TEXT NOT NULL DEFAULT '',
    price        INTEGER NOT NULL DEFAULT 0,
    isbn         TEXT NOT NULL DEFAULT '',
    description  TEXT NOT NULL DEFAULT '',
    pages        INTEGER NOT NULL DEFAULT 0,
    volume_link  TEXT NOT NULL DEFAULT '',
    UNIQUE (work_id, volume)
);
