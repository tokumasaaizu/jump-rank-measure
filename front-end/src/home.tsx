import React, { useEffect, useState } from "react";

import { Home, List, BookOpen, Database, Menu, X, ChevronLeft, ArrowRight} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Link, useLocation } from 'react-router-dom';
import { Box, Container, Grid, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Footer from "./components/Footer/footer";
import AdBannerAdsense from "./components/Layout/AdBannerAdsense";

// --- 型定義 ---
interface RankingItem {
  rank: number;
  title: string;
  isbn: string;
}

type DataRow = {
  [key: string]: any;
  title?: string;
  date?: string;
  week?: string;
};

type RankingRow = {
  issue_label: string;
  title: string;
  rank_num: number;
};

type SeriesRanking = {
  series: string;
  average: number;
};

export default function JumpDashboard() {
  // サイドバーの開閉状態を管理
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'home' | 'all'>('home');


    const [data, setData] = useState<DataRow[]>([]);
    const [datathisweek, setDataThisWeek] = useState<DataRow[]>([]);
    //const [rankThisWeek, setRankThisWeek] = useState<RankingRow>([]);
    const [displayPeriod, setDisplayPeriod] = useState<number>(4); // 表示期間（週数）
    const [filteredData, setFilteredData] = useState<DataRow[]>([]);
    const [topSeries, setTopSeries] = useState<string[]>([]);
    const [displayCount, setDisplayCount] = useState<number>(5); // 表示する作品数
    const [averageRankings, setAverageRankings] = useState<SeriesRanking[]>([]);
    
    // 各作品の表示状態を管理
    const [visibleSeries, setVisibleSeries] = useState<{ [key: string]: boolean }>({});
  
    useEffect(() => {
      //fetch("/past-ranking-data.csv")
      fetch("/ranking")
        .then((response) => response.json())
        .then((rows: RankingRow[]) => {
          // =========================================
          // ① issueごとにまとめて「横持ち」形式へ変換
          // =========================================
          const grouped: { [issue: string]: any } = {};
          
          rows.forEach((row) => {
          if (!grouped[row.issue_label]) {
            grouped[row.issue_label] = {
              title: row.issue_label,
            };
          }
  
          grouped[row.issue_label][row.title] = row.rank_num;
          });
  
          const parsedData = Object.values(grouped);
          
          // =========================================
          // ② 作品カラム取得
          // =========================================
          const seriesColumns = Array.from(
            new Set(rows.map((r) => r.title))
          );
  
          // =========================================
          // ③ 平均順位計算（今までと同じロジック）
          // =========================================
          const seriesRankings: {
            [key: string]: { sum: number; count: number };
          } = {};
            
            // 各作品の順位の合計とデータ数を集計
          parsedData.forEach((row: any) => {
            seriesColumns.forEach((series) => {
              if (!seriesRankings[series]) {
                seriesRankings[series] = { sum: 0, count: 0 };
              }
  
              const rank = row[series];
              if (typeof rank === "number") {
                seriesRankings[series].sum += rank;
                seriesRankings[series].count += 1;
              }
            });
          });
  
          // 平均順位を計算してソート
          const rankings = Object.entries(seriesRankings)
            .map(([series, stats]) => ({
              series,
              average: stats.sum / stats.count,
            }))
            .sort((a, b) => a.average - b.average);// 平均順位が低い（上位の）順にソート
  
          setAverageRankings(rankings);
  
            
          // 上位作品の選出
          const topSeriesNames = rankings
          .slice(0, displayCount)
          .map((item) => item.series);
  
          setTopSeries(topSeriesNames);
  
          const initialVisibility = seriesColumns.reduce(
            (acc, series) => ({
              ...acc,
              [series]: topSeriesNames.includes(series),
            }),
            {}
          );
  
          setVisibleSeries(initialVisibility);
  
          setData(parsedData);
          setFilteredData(parsedData.slice(0, displayPeriod));
        }); // then

  
      fetch("/ranking?latest=true")
        .then((response)=>response.json())
        .then((jsonData)=>{
          setDataThisWeek(jsonData);
        });
  
  
    }, [displayCount]);
  
    // 表示期間が変更されたときのフィルタリング
    useEffect(() => {
      if (data.length > 0) {
        setFilteredData(data.slice(0, displayPeriod).reverse());
      }
    }, [displayPeriod, data]);

    
  
  // テーブルのカラム名を取得（データが空の場合は空配列）
  const label = datathisweek.length > 0 ? datathisweek[0].issue_label : [];
  const columns = datathisweek.length > 0 ? Object.keys(datathisweek[0]) : [];



  // 共通のスタイル定数
  const colors = {
    bg: '#0f172a',
    sidebar: '#1a2235',
    content: '#161d2f',
    accent: '#3b82f6',
    border: '#2d3748',
    textMuted: '#94a3b8'
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

  // --- ヘルパー：表示用のランキングデータを生成 ---
  const currentRankings = [...datathisweek]
  .sort((a, b) => (a.rank_num || 0) - (b.rank_num || 0))
  .map(item => ({
    rank: item.rank_num,
    title: item.title,
    isbn: item.isbn || "" // APIにISBNがあれば表示
  }));

  const currentIssueLabel = datathisweek.length > 0 ? datathisweek[0].issue_label : "データ読み込み中...";

  // アフィリエイトコンポーネント
  const AdBanner = () => (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <a href="//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3500324&pid=892565429" rel="nofollow">
        <img src="//ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3500324&pid=892565429" style={{ border: 0 }} alt="ad-banner" />
      </a>
    </div>
  );



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
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.2em', marginLeft:'70px' }}>ダッシュボード</h1>
      <div style={{ width: '24px' }} />
    </div>
      
      {/* ハンバーガーメニューボタン（モバイル・デスクトップ共通） */}
    <button 
      onClick={() => setSidebarOpen(!isSidebarOpen)}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 100,
        backgroundColor: colors.sidebar,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        padding: '8px',
        cursor: 'pointer',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
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

      {/* メインコンテンツ（中央のランキングのみ） */}
      <main style={{ 
        flex: 1, 
        //padding: '80px 40px 40px 40px',
        paddingRight:'10px',
        maxWidth: '800px',
        margin: '0 auto',
        transition: 'margin-left 0.3s ease-in-out'
      }}>
        <header style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>最新{currentIssueLabel}</h2>
          <div style={{ width: '60px', height: '4px', backgroundColor: colors.accent }}></div>
        </header>
        <h3 style={{ fontSize: '16px', color: colors.textMuted, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '4px', height: '16px', backgroundColor: colors.accent }}></span>
          {currentIssueLabel}の順位表
        </h3>
        {viewMode === 'home' ? (
          /* --- ホーム表示 --- */
        <>
          <div style={{ backgroundColor: colors.content, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}` }}>
            {currentRankings.slice(0, 5).map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', width: '40px', fontStyle: 'italic' }}>{item.rank}</span>
                <span style={{ padding: '15px 20px', fontSize: '16px' }}>
                    <Link 
                        to={`/detail?title=${encodeURIComponent(String(item.title))}`}
                        style={{ 
                          color: 'white', 
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >{item.title}
                    </Link>
                  </span>
              </div>
            ))}

            <button 
              onClick={() => setViewMode('all')}
              style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#252f48', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
            >
              全順位を見る
            </button>
          </div>
        </>
      ) : (
      /* --- 全順位テーブル表示 --- */
      <>
        <div style={{ backgroundColor: colors.content, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: colors.textMuted, fontSize: '14px' }}>
                <th style={{ padding: '15px 20px' }}>順位</th>
                <th style={{ padding: '15px 20px' }}>作品名</th>
              </tr>
            </thead>
            <tbody>
              {currentRankings.map((item, index) => (
                <tr key={index} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '15px 20px', fontWeight: 'bold', fontStyle: 'italic', fontSize: '18px' }}>{item.rank}位</td>
                  <td style={{ padding: '15px 20px', fontSize: '16px' }}>
                    <Link 
                        to={`/detail?title=${encodeURIComponent(String(item.title))}`}
                        style={{ 
                          color: 'white', 
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >{item.title}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* --- ここに追加：全順位を隠すボタン --- */}
            <div style={{ padding: '20px', borderTop: `1px solid ${colors.border}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <button 
                onClick={() => setViewMode('home')}
                style={{ 
                  width: '100%', padding: '12px', backgroundColor: 'transparent', 
                  border: `1px solid ${colors.border}`, borderRadius: '8px', 
                  color: colors.textMuted, cursor: 'pointer', fontWeight: 'bold' 
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                全順位を隠す
              </button>
            </div>
        </div>
      </>
    )}

        {/* トレンドグラフ */}
        <section>
          {/* アフィリエイトリンクを追加 */}
            <AdBanner />
          <h3 style={{ fontSize: '16px', color: colors.textMuted, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '16px', backgroundColor: colors.accent }}></span>
            トレンド推移
          </h3>
          <div style={{ 
            backgroundColor: colors.content, 
            borderRadius: '12px',
            border: `1px solid ${colors.border}`
          }}>

            {/* トレンドグラフ内のセレクトボックス部分 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              marginBottom: 3, 
              marginTop: 3,
              paddingRight: '20px' // 右側に少し余白
            }}>
              {[
                { label: "表示期間", value: displayPeriod, setter: setDisplayPeriod, items: [
                  { v: 4, t: "1ヶ月" }, { v: 12, t: "3ヶ月" }
                ]},
                { label: "表示作品数", value: displayCount, setter: setDisplayCount, items: [
                  { v: 3, t: "TOP 3" }, { v: 5, t: "TOP 5" }, { v: 10, t: "TOP 10" }
                ]}
              ].map((item, idx) => (
                <FormControl key={idx} variant="outlined" size="small" sx={{ 
                  minWidth: 130,
                  // ラベル（表示期間・表示作品数）の色を白に
                  '& .MuiInputLabel-root': { color: '#cbd5e1' }, 
                  '& .MuiInputLabel-root.Mui-focused': { color: colors.accent },
                }}>
                  <InputLabel id={`select-label-${idx}`}>{item.label}</InputLabel>
                  <Select
                    labelId={`select-label-${idx}`}
                    value={item.value}
                    label={item.label}
                    onChange={(e) => item.setter(Number(e.target.value))}
                    sx={{
                      color: 'white', // 選択された文字の色
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)', // 枠線の色（薄い白）
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)', // ホバー時の枠線
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.accent, // フォーカス時の枠線
                      },
                      '.MuiSvgIcon-root': {
                        color: 'white', // 右側の矢印の色
                      },
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', // ほんのり背景色
                    }}
                    // メニュー（ドロップダウン）自体の色設定
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: colors.sidebar,
                          color: 'white',
                          '& .MuiMenuItem-root:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '& .Mui-selected': {
                            bgcolor: `${colors.accent}44 !important`, // 選択中項目の背景
                          },
                        },
                      },
                    }}
                  >
                    {item.items.map(option => (
                      <MenuItem key={option.v} value={option.v}>{option.t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>
            
          <ResponsiveContainer width="100%" height={500}>
            <LineChart 
              data={filteredData} 
              margin={{ top: 30, right: 30, left: 10, bottom: 10 }} // マージンを微調整
            >
              {/* カスタムドロップシャドウの定義（SVGフィルター） */}
              <defs>
                <filter id="shadow" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
                </filter>
              </defs>

              {/* グリッドをより薄く、ダッシュに */}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              
              <XAxis 
                dataKey="title" 
                reversed={true} // 前回の修正を反映（最新が右）
                tick={{ fontSize: 12, fill: colors.textMuted }}
                axisLine={{ stroke: colors.border }}
                tickLine={false} // チック線を消してスッキリ
                padding={{ left: 20, right: 20 }} // 左右に少し余裕を持たせる
              />
              <YAxis 
                reversed={true}
                domain={[1, displayCount]} // 動的に変更
                tickCount={displayCount}
                allowDecimals={false}
                tick={{ fontSize: 13, fill: colors.textMuted, fontWeight: 'bold' }}
                axisLine={false} // Y軸の縦線を消す
                tickLine={false}
                width={30} // Y軸の幅を固定
              />
              
              {/* ツールチップのデザインをダークモードに */}
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: colors.sidebar, 
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
                itemStyle={{ color: 'white', fontSize: '14px' }}
                labelStyle={{ color: colors.textMuted, marginBottom: '4px', fontWeight: 'bold' }}
                cursor={{ stroke: colors.accent, strokeWidth: 1, strokeDasharray: '6 6' }} // カーソル線をスタイリッシュに
              />
              
              {/* レジェンドのデザインを調整 */}
              <Legend 
                iconType="circle" // アイコンを円に
                wrapperStyle={{
                  paddingTop: '20px',
                  paddingBottom: '10px',
                  paddingLeft: '15px',
                  paddingRight: '1px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', // ほんのり白を混ぜて浮かせる
                  border: `1px solid ${colors.border}`,
                  maxWidth: '90%', // 幅を少し狭く
                  margin: '0 auto',
                }}
                onClick={(e: any) => {
                  if (e.dataKey && topSeries.includes(e.dataKey)) {
                    setVisibleSeries(prev => ({
                      ...prev,
                      [e.dataKey as string]: !prev[e.dataKey as string]
                    }));
                  }
                }}
                formatter={(value, entry) => {
                  if (!topSeries.includes(value)) return null;
                  const isActive = visibleSeries[value];
                  return (
                    <span 
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        opacity: isActive ? 1 : 0.4, // 非アクティブ時をより薄く
                        transition: 'all 0.2s ease',
                        marginRight: '15px', // 項目間の余白
                        color: 'white', // 文字色は白
                        fontSize: '13px'
                      }}
                    >
                      {/* Recharts標準のアイコン（entry.color）はそのまま使い、文字だけカスタム */}
                      {value}
                    </span>
                  );
                }}
              />

            {topSeries.map((series, index) => {
              // より鮮やかでダークモードに映えるカラーパレット
              const lineColors = [
                '#3b82f6', // 青 (colors.accent)
                '#ef4444', // 赤
                '#10b981', // 緑
                '#f59e0b', // オレンジ
                '#a855f7', // 紫
                '#ec4899', // ピンク
                '#22d3ee', // 水色
                '#84cc16', // ライム
                '#f43f5e', // ローズ
                '#fb923c'  // ライトオレンジ
              ];
            
            const isActive = visibleSeries[series];
            const color = lineColors[index % lineColors.length];
            
            return (
              <Line
                key={series}
                type="linear" // ★曲線から直線（折れ線）に変更
                dataKey={series}
                stroke={color}
                strokeWidth={isActive ? 3 : 1} // ★アクティブ時は太く
                strokeOpacity={isActive ? 1 : 0.1} // ★非アクティブ時は極めて薄く
                dot={{ 
                  r: isActive ? 5 : 0, // ★非アクティブ時はドットを消す
                  strokeWidth: 2,
                  stroke: isActive ? '#fff' : color, // ★白枠を付ける
                  fill: color,
                  filter: isActive ? 'url(#shadow)' : 'none' // ★ドットにも影
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: '#fff', 
                  strokeWidth: 3,
                  fill: color,
                  filter: 'url(#shadow)'
                }}
                filter={isActive ? 'url(#shadow)' : 'none'} // ★線に影を付ける
                connectNulls={true} // データが飛んでいても線を繋ぐ
                isAnimationActive={true} // アニメーションを有効に
                animationDuration={500}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    <AdBannerAdsense />
    </main>
    <Footer />
  </div>
  );
}
