import React, { useState, useEffect } from 'react';
import { 
  Home, List, BookOpen, Database, Menu, X, ChevronLeft, ChevronRight, ArrowRight, ChevronDown, Triangle
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Link, useLocation } from 'react-router-dom';
import Footer from "./components/Footer/footer";


// --- 型定義 ---
interface RankingItem {
  rank: number;
  title: string;
  isbn: string;
}

interface IssueData {
  issue: string;
  rankings: RankingItem[];
}

interface IssueInfo {
  id: number;
  issue_no: number;
  issue_label: string;
}


//const issueKeys = Object.keys(allData);

export default function IssueRanking() {
  const issueKeys = 5;
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'home' | 'all'>('home');
  // 号数の一覧（APIから取得）
  const [issueList, setIssueList] = useState<IssueInfo[]>([]);
  // 現在選択されている号のインデックス
  const [currentIssueIdx, setCurrentIssueIdx] = useState(0);
  // 現在選択されている号のランキングデータ
  const [currentRankings, setCurrentRankings] = useState<RankingItem[]>([]);
    const [previousRankings, setPreviousRankings] = useState<RankingItem[]>([]); // 前号
  const [isLoading, setIsLoading] = useState(true);

  //const currentData = allData[issueKeys[currentIssueIdx]];

  const colors = {
    bg: '#0f172a',
    sidebar: '#1a2235',
    card: '#161d2f',
    accent: '#3b82f6',
    border: '#2d3748',
    textMuted: '#94a3b8',
    content: '#161d2f',
  };

  // 共通レイアウトスタイル
  const sidebarStyle: React.CSSProperties = {
    width: '240px',
    backgroundColor: colors.sidebar,
    position: 'fixed',
    height: '100vh',
    left: isSidebarOpen ? '0' : '-240px',
    transition: 'left 0.3s ease',
    zIndex: 90,
    paddingTop: '80px',
    borderRight: `1px solid ${colors.border}`,
    boxShadow: isSidebarOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'
  };

  const location = useLocation(); // 現在のパスを取得して「アクティブ状態」を判定する

  // 1. 初回マウント時に号数一覧を取得
  useEffect(() => {
    //fetch("http://13.231.219.129:8080/issues")
    fetch("/issues")
      .then(res => res.json())
      .then((data: IssueInfo[]) => {
        // 新しい順（降順）に並べ替えてセット
        const sorted = data.sort((a, b) => b.id - a.id);
        setIssueList(sorted);
      })
      .catch(err => console.error("Issue fetch error:", err));
  }, []);


    // 2. 選択中の号が変わるたびにランキングを取得
  useEffect(() => {
    if (issueList.length === 0) return;

    setIsLoading(true);
    const selectedIssue = issueList[currentIssueIdx];
    const prevIssue = issueList[currentIssueIdx + 1]; // 1つ古い号。最新号→前号..という順番でリストに入っているから +1してる

    // 現在の号と前の号を両方フェッチする
    const fetchCurrent = fetch(`/ranking?issue_label=${encodeURIComponent(selectedIssue.issue_label)}`).then(res => res.json());
    
    // 前の号がある場合のみフェッチ
    const fetchPrevious = prevIssue 
      ? fetch(`/ranking?issue_label=${encodeURIComponent(prevIssue.issue_label)}`).then(res => res.json())
      : Promise.resolve([]);

    Promise.all([fetchCurrent, fetchPrevious])
      .then(([currData, prevData]) => {
        const mapData = (data: any[]) => data.sort((a, b) => a.rank_num - b.rank_num).map(item => ({
          rank: item.rank_num,
          title: item.title,
          isbn: item.isbn || ""
        }));

        setCurrentRankings(mapData(currData));
        setPreviousRankings(mapData(prevData));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Ranking fetch error:", err);
        setIsLoading(false);
      });
  }, [currentIssueIdx, issueList]);


    // --- 順位変動を計算するヘルパー関数 ---
  const getRankChange = (title: string, currentRank: number) => {
    const prevWork = previousRankings.find(p => p.title === title);
    if (!prevWork) return { type: 'NEW', value: 0 }; // 前号にいない場合

    const diff = prevWork.rank - currentRank; // 例: 前回5位 - 今回2位 = +3 (上昇)
    if (diff > 0) return { type: 'UP', value: diff };
    if (diff < 0) return { type: 'DOWN', value: Math.abs(diff) };
    return { type: 'KEEP', value: 0 };
  };

  // --- 変動表示用コンポーネント ---
 // --- 変動表示用コンポーネント ---
  const RankDiffIndicator = ({ title, currentRank }: { title: string, currentRank: number }) => {
    const change = getRankChange(title, currentRank);
    
    // NEW: 落ち着いた青系（新登場の爽やかさ）
    if (change.type === 'NEW') {
      return (
        <span style={{ 
          fontSize: '9px', // テキストが長いため少し小さめに
          color: '#94a3b8', 
          fontWeight: 'bold', 
          backgroundColor: 'rgba(148, 163, 184, 0.1)', 
          padding: '2px 4px', 
          borderRadius: '4px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          whiteSpace: 'nowrap', // 改行を防ぐ
          display: 'inline-block'
        }}>
          新連載or休載明け
        </span>
      );
    }

    // UP: 落ち着いた緑（ポジティブ）
    if (change.type === 'UP') {
      return (
        <span style={{ 
          fontSize: '12px', 
          color: '#4ade80', // 明るすぎない緑
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold' 
        }}>
          <Triangle size={8} fill="#4ade80" style={{ marginRight: '2px' }} />
          {change.value}
        </span>
      );
    }

    // DOWN: 警告の赤（ネガティブ）
    if (change.type === 'DOWN') {
      return (
        <span style={{ 
          fontSize: '12px', 
          color: '#f87171', // 柔らかい赤
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold' 
        }}>
          <Triangle size={8} fill="#f87171" style={{ marginRight: '2px', transform: 'rotate(180deg)' }} />
          {change.value}
        </span>
      );
    }

    // KEEP: 変化なし
    return <span style={{ fontSize: '14px', color: '#475569' }}>-</span>;
  };



  // 号数を切り替える関数
  const changeIssue = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentIssueIdx > 0) {
      setCurrentIssueIdx(currentIssueIdx - 1);
    } else if (direction === 'prev' && currentIssueIdx < 5 - 1) {
      setCurrentIssueIdx(currentIssueIdx + 1);
    }
  };

  return (
      <div style={{ 
      //display: 'flex', 
      backgroundColor: colors.bg, 
      minHeight: '100vh', 
      color: 'white', 
      fontFamily: 'sans-serif',
      //position: 'relative',
      //overflowX: 'hidden'
      padding: '15px',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
    }}>

      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.2em', marginLeft:'70px' }}>雑誌号別ランキング</h1>
        <div style={{ width: '24px' }} />
      </div>

      {/* ハンバーガーメニュー */}
      <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 100, backgroundColor: colors.sidebar, border: `1px solid ${colors.border}`, borderRadius: '4px', padding: '8px', cursor: 'pointer', color: 'white' }}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>


      {/* サイドバー（ドロワー形式） */}
      <aside style={sidebarStyle}>
      <div style={{ padding: '0 24px', marginBottom: '30px', fontSize: '18px', fontWeight: 'bold' }}>
        ジャンプ順位管理
      </div>
      <nav>
        {[
          { icon: <Home size={18}/>, label: "ホーム", path: "/home", mode: 'home' as const },
          { icon: <List size={18}/>, label: "号別ランキング", path: "/issue", mode: 'all' as const },
          { icon: <BookOpen size={18}/>, label: "作品一覧", path: "/series", mode: 'all' as const },
        ].map((item, i) => {
          // 現在のパスと一致しているか判定
          const isActive = location.pathname === item.path;
  
          return (
            <Link 
              key={i} 
              to={item.path}
              // ページ遷移と同時にサイドバーを閉じる
              onClick={() => setSidebarOpen(false)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '15px 24px', 
                cursor: 'pointer', 
                textDecoration: 'none', // Link(a)タグの下線を消す
                color: isActive ? colors.accent : 'white', 
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                transition: 'background-color 0.2s',
                borderLeft: isActive ? `4px solid ${colors.accent}` : '4px solid transparent',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '14px', fontWeight: isActive ? 'bold' : 'normal' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
      
    {/* オーバーレイ（サイドバーが開いている時に背景を暗くする） */}
    {isSidebarOpen && (
      <div 
        onClick={() => setSidebarOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 80
        }}
      />
    )}

      {/* メインエリア */}
      <main style={{ flex: 1, padding: '20px 10px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 号数切り替えセレクター */}
        {issueList.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
            <button onClick={() => changeIssue('prev')} disabled={currentIssueIdx === issueList.length - 1} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: currentIssueIdx === issueList.length - 1 ? 0.3 : 1 }}>
              <ChevronLeft size={32} />
            </button>

            <div style={{ position: 'relative', width: '280px' }}>
              <select 
                value={issueList[currentIssueIdx].issue_label}
                onChange={(e) => {
                  const idx = issueList.findIndex(item => item.issue_label === e.target.value);
                  setCurrentIssueIdx(idx);
                }}
                style={{
                  width: '100%', padding: '12px 20px', backgroundColor: colors.card,
                  color: 'white', border: `1px solid ${colors.border}`, borderRadius: '8px',
                  fontSize: '18px', fontWeight: 'bold', appearance: 'none', cursor: 'pointer', textAlign: 'center'
                }}
              >
                {issueList.map(item => <option key={item.id} value={item.issue_label}>{item.issue_label}</option>)}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: colors.textMuted }} />
            </div>

            <button onClick={() => changeIssue('next')} disabled={currentIssueIdx === 0} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: currentIssueIdx === 0 ? 0.3 : 1 }}>
              <ChevronRight size={32} />
            </button>
          </div>
        )}

        {/* コンテンツ表示 */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>読み込み中...</div>
        ) : (
          viewMode === 'home' ? (
            <div style={{ backgroundColor: colors.card, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}` }}>
              {currentRankings.slice(0, 5).map((item) => (
                <div key={item.title} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', width: '40px', fontStyle: 'italic' }}>{item.rank}<small>位</small></span>
                  <span style={{ fontSize: '18px' }}>{item.title}</span>
                </div>
              ))}
              <button onClick={() => setViewMode('all')} style={{ width: '100%', marginTop: '20px', padding: '14px', backgroundColor: '#252f48', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                全順位を表示
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: colors.card, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {currentRankings.map((item) => (
                    <tr key={item.title} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      {/* 順位：フォントを少し小さくしてシャープに */}
                      <td style={{ padding: '15px', fontSize: '16px', fontWeight: 'bold', width: '40px', textAlign: 'center' }}>
                        {item.rank}<small>位</small>
                      </td>
                      
                      {/* 変動：中央揃えを強化 */}
                      <td style={{ padding: '15px 0', width: '50px', textAlign: 'center' }}>
                        <RankDiffIndicator title={item.title} currentRank={item.rank} />
                      </td>

                      {/* 作品名：少し左に寄せて読みやすく */}
                      <td style={{ padding: '15px 10px', fontSize: '15px', fontWeight: 500 }}>
                        {item.title}
                      </td>

                      {/* 詳細リンク */}
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <Link to={`/detail?title=${encodeURIComponent(item.title)}`} style={{ color: colors.accent, textDecoration: 'none', fontSize: '12px', opacity: 0.8 }}>
                          詳細 ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setViewMode('home')} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '13px' }}>閉じる</button>
            </div>
          )
        )}
      </main>
    </div>
  );
}