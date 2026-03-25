import React, { useEffect, useState } from "react";

/* =========================
   型定義
========================= */
interface Ranking {
  work_id: number;
  issue_id: number;
  issue_label:string;
  rank_num:number;
  title:string;
}

interface UpdatePayload {
  issue_id: number;
  rankings: {
    work_id: number;
    rank: number;
  }[];
}

/* =========================
   コンポーネント
========================= */
const AdminRankingPage: React.FC = () => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------
     一覧取得
  -------------------------- */
  const fetchRankings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/ranking?latest=true");
      if (!res.ok) {
        throw new Error("取得失敗");
      }
      const data: Ranking[] = await res.json();
      setRankings(data);
    } catch (err) {
      setError("データ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };


  /* -------------------------
     更新処理
  -------------------------- */
    // 号単位で一括更新
  const handleSave = async (issueId: number) => {
    const issueRankings = rankings.filter(
      (r) => r.issue_id === issueId
    );

    const payload: UpdatePayload = {
      issue_id: issueId,
      rankings: issueRankings.map((r) => ({
        work_id: r.work_id,
        rank: r.rank_num,
      })),
    };


    const res = await fetch("/ranking", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("更新失敗");
      return;
    }

    alert("保存しました");
    fetchRankings();
  };



  /* -------------------------
     初期ロード
  -------------------------- */
  useEffect(() => {
    fetchRankings();
  }, []);

  // issue単位でグループ化
  const grouped = rankings.reduce<Record<number, Ranking[]>>(
    (acc, cur) => {
      if (!acc[cur.issue_id]) {
        acc[cur.issue_id] = [];
      }
      acc[cur.issue_id].push(cur);
      return acc;
    },
    {}
  );


  /* =========================
     表示
  ========================= */
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>ジャンプ順位 管理画面</h1>

      {loading && <p>読み込み中...</p>}

      {Object.entries(grouped).map(([issueIdStr, list]) => {
        const issueId = Number(issueIdStr);

        return (
          <div key={issueId} style={{ marginBottom: "50px" }}>
            <h2>【{issueId}号】</h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
            
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={thStyle}>順位</th>
                  <th style={thStyle}>作品名</th>
                </tr>
              </thead>
              
              <tbody>
                {list
                  .sort((a, b) => a.rank_num - b.rank_num)
                  .map((r) => (
                    <tr key={r.work_id}>
                      <td style={tdStyle}>
                        <input
                          type="number"
                          value={r.rank_num}
                          min={1}
                          onChange={(e) => {
                            const newRank = Number(
                              e.target.value
                            );

                            setRankings((prev) =>
                              prev.map((item) =>
                                item.issue_id === r.issue_id &&
                                item.work_id === r.work_id
                                  ? {
                                      ...item,
                                      rank_num: newRank,
                                    }
                                  : item
                              )
                            );
                          }}
                          style={{ width: "60px" }}
                        />
                      </td>
                      <td style={tdStyle}>
                        {r.title}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div style={{ marginTop: "15px" }}>
              <button
                onClick={() => handleSave(issueId)}
                style={saveButtonStyle}
              >
                この号を保存
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};



const thStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};

const buttonStyle: React.CSSProperties = {
  padding: "4px 10px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "4px",
};
const saveButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default AdminRankingPage;