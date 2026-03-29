import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {Container,Typography,Grid,Paper,Box,Chip,Divider,Card,CardContent,CardMedia} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Triangle, ArrowUp, ArrowDown, BookOpen } from 'lucide-react';
import {AreaChart,Area,XAxis,YAxis,CartesianGrid,ResponsiveContainer, Tooltip} from 'recharts';
import AdBannerAdsense from "./components/Layout/AdBannerAdsense";

type RankingRow = {
  issue_label: string;
  title: string;
  rank_num: number;
  rank_change:boolean;
};

interface Work {
  id: number;
  work_id: number;
  title: string;
  title_kana: string;
  title_eng: string;
  author: string;
  serialization_start_date: string;
  end_flg: boolean;
  kyusai_flg: boolean;
  story: string;
  genre: string;
  created_at: string;
  updated_at: string;
  peak_rank: number;
  status: string;
  image_url: string;
  official_url: string;
};

interface Volume {
  volume: number;
  releaseDate: string;
  coverimage: string;
  price: number;
  isbn: string;
  description: string;
  pages: number;
  volume_link: string;
}

interface RankingData {
  title: string;
  [key: string]: string | number;
}

type SeriesRanking = {
  series: string;
  //average: number;
      averageNum: number;
    average: string;
};


const DetailPage = () => {
  const [searchParams] = useSearchParams();
  const [mangaDetail, setMangaDetail] = useState<Work | null>(null);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(5); // 表示する作品数
  const [topSeries, setTopSeries] = useState<string[]>([]);
  const [averageRankings, setAverageRankings] = useState<SeriesRanking[]>([]);
  const [eachWork, setEachWork] = useState<RankingRow[]>([]);
  // この作品の平均順位
  const [eachAverageWork, setEachAverageWork] = useState("");
  const [bestRank, setBestRank] = useState(0);
  const [worstRank, setWorstRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const title = searchParams.get('title');
  // 各作品の表示状態を管理
  const [visibleSeries, setVisibleSeries] = useState<{ [key: string]: boolean }>({});
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  
// 現在の順位と前回の順位を取得
const currentRank = eachWork[0]?.rank_num;
const previousRank = eachWork[1]?.rank_num;

// 判定ロジック（データが2件以上ある場合のみ比較）
const isRankUp = eachWork.length > 1 && currentRank < previousRank;   // 数値が小さくなれば上昇
const isRankDown = eachWork.length > 1 && currentRank > previousRank; // 数値が大きくなれば下落

const navigate = useNavigate();

  const colors = {
    bg: '#0f172a',
    sidebar: '#1a2235',
    card: '#161d2f',
    accent: '#3b82f6',
    border: '#2d3748',
    textMuted: '#94a3b8',
    content: '#161d2f',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 漫画詳細の取得
        if (!title) return;
        const detailResponse = await fetch(`/work/${encodeURIComponent(title)}`);
        const detailData = await detailResponse.json();
        //let manga = detailData.manga.find((m: MangaDetail) => m.title === title);

        if (!mangaDetail?.title) {
            // タイトルが存在することを確認
            if (!title) {
              console.error('Title is empty or null');
              return;
            }
        }
        
        setMangaDetail(detailData || null);
        // ランキングデータの取得
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
          //setData(parsedData);
          setRankingData(parsedData);


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
          .map(([series, stats]) => {
          // 計算結果を一度変数に入れる
          const avg = stats.sum / stats.count;
          return {
            series,
            // ソート用に数値のまま保持
            averageNum: avg,
            // 表示用に小数点第一位で固定（文字列）
            average: avg.toFixed(1),
          };
         })
        // 数値データ(averageNum)を使ってソート
        .sort((a, b) => a.averageNum - b.averageNum);
        setAverageRankings(rankings);

        rankings.forEach(average => {
          if(average.series === title){
            setEachAverageWork(average.average);
          }
          });
          
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

        })

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }

    }; // fetchData

    fetchData();
  }, [title]);


   // 個作品の連載順位の推移の取得
    useEffect(() => {
      const fetchData = async () => {
        if (!mangaDetail) return;
  
        try {
          const res = await fetch(`/ranking?work_id=${mangaDetail.work_id}`);
          const res2 = await fetch(`/ranking?best_rank=${mangaDetail.work_id}`);
          const res3 = await fetch(`/ranking?worst_rank=${mangaDetail.work_id}`);
          if (!res.ok) {
            throw new Error("Failed to fetch volumes");
          }
  
          const dataRanking: RankingRow[] = await res.json();
          const best = await res2.json();
          const worst = await res3.json();
          setEachWork(dataRanking);
          setBestRank(best.best_rank);
          setWorstRank(worst.worst_rank);
        } catch (err) {
          console.error(err);
        }
      };
  
      fetchData();
    }, [mangaDetail]);


  useEffect(() => {
    const fetchVolumeData = async () => {
      if (!mangaDetail) return;

      try {
        const res = await fetch(`/volumes?work_id=${mangaDetail.work_id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch volumes");
        }

        const data: Volume[] = await res.json();
        setVolumes(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVolumeData();
  }, [mangaDetail]);




    if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!mangaDetail) {
    return (
      <Container>
        <Typography color="error">漫画が見つかりませんでした。</Typography>
      </Container>
    );
  }

    // アフィリエイトコンポーネント
  const AdBanner = () => (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <a href="//ck.jp.ap.valuecommerce.com/xxxx" rel="nofollow">
        <img src="//ad.jp.ap.valuecommerce.com/xxxx" style={{ border: 0 }} alt="ad-banner" />
      </a>
    </div>
  );
  

  return (
    /* 全体のコンテナ：背景色を強制的に指定 */
    <div style={{
      backgroundColor: '#1b2230',
      color: '#ffffff',
      minHeight: '100vh',
      width: '94%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        {/**<Link to="/home"><ChevronLeft size={24} color="#94a3b8" /></Link>*/}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            padding: '8px' 
          }}
        >
          <ChevronLeft size={24} color="#94a3b8" />
        </button>

        <h1 style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.2em', margin: 0 }}>{mangaDetail.title}</h1>
        <div style={{ width: '24px' }} />
      </div>

      {/* --- 追加: 作品メインビジュアル & あらすじセクション --- */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
          {/* 表紙画像 */}
          <div style={{ 
            flexShrink: 0, 
            width: '140px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img 
              src={mangaDetail.image_url || "https://via.placeholder.com/140x200?text=NO+IMAGE"} 
              alt={mangaDetail.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* タイトルと基本情報 */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0', lineHeight: 1.2 }}>
              {mangaDetail.title}
            </h2>
            <p style={{ fontSize: '13px', color: '#60a5fa', margin: '0 0 12px 0', fontWeight: 'bold' }}>
              {mangaDetail.author}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <Chip 
              label="ジャンル"
              size="small" 
              sx={{ bgcolor: '#2a5496', color: 'white', fontSize: '10px' }} 
            />
            <Chip 
              label={mangaDetail.end_flg ? "完結" : "連載中"} 
              size="small" 
              variant="outlined" 
              sx={{ 
                // 文字色の切り替え
                color: mangaDetail.end_flg ? '#fbbf24' : '#3b82f6', 
                // 枠線の色の切り替え
                borderColor: mangaDetail.end_flg ? '#fbbf24' : '#3b82f6', 
                fontSize: '10px',
                fontWeight: 'bold',
                // 背景を少しだけ色づけして視認性を高める（オプション）
                bgcolor: mangaDetail.end_flg ? 'rgba(59, 130, 246, 0.1)' : 'rgba(251, 191, 36, 0.1)'
              }} 
            />
          </div>
          </div>
        </div>

        {/* あらすじ */}
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: 'rgba(255,255,255,0.03)', 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative' // ボタン配置用
        }}>
          <h3 style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>STORY/Character</h3>
          
          <div style={{
            position: 'relative',
            maxHeight: isStoryExpanded ? 'none' : '90px', // 折りたたみ時の高さ
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out'
          }}>
            <p style={{ 
              fontSize: '13px', 
              lineHeight: '1.6', 
              color: '#cbd5e1', 
              margin: 0,
              whiteSpace: 'pre-wrap' // 改行コードを反映
            }}>
              {mangaDetail.story || "作品紹介データがありません。"}
            </p>

            {/* 未展開時のみグラデーションをかける */}
            {!isStoryExpanded && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: 'linear-gradient(transparent, rgba(30, 38, 54, 0.95))' // 背景色に馴染ませる
              }} />
            )}
          </div>

          {/* 切り替えボタン */}
          <button 
            onClick={() => setIsStoryExpanded(!isStoryExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              fontSize: '12px',
              fontWeight: 'bold',
              marginTop: '8px',
              padding: '4px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isStoryExpanded ? (
              <>閉じる <ArrowUp size={12} /></>
            ) : (
              <>続きを読む <ArrowDown size={12} /></>
            )}
          </button>
        </div>
      </section>

      {/* 4つのカードセクション */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '32px' }}>
        <StatBox 
          title="最新順位" 
          value={currentRank ?? "-"} 
          unit="位" 
          // 色の分岐
          color={
            isRankUp ? "#2d5a50" : 
            isRankDown ? "#5a2d2d" : // 下落時は暗めの赤
            "#2a5496"                // 変動なし、またはデータ1件のみ
          } 
          // アイコンの分岐
          icon={
            isRankUp ? (
              <Triangle size={8} fill="#4ade80" color="#4ade80" /> 
            ) : isRankDown ? (
              <Triangle size={8} fill="#f87171" color="#f87171" style={{ transform: 'rotate(180deg)' }} />
            ) : null
          }
        />
        <StatBox title="平均順位" value={eachAverageWork} unit="位" color="#252b39" />
        <StatBox title="最高順位" value={bestRank} unit="位" color="#252b39" border="1px solid #334155" />
        <StatBox title="最低順位" value={worstRank} unit="位" color="#252b39" border="1px solid #334155" />
      </div>

      {/* グラフエリア */}
      <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '16px' }}>順位推移</h2>
      <div style={{ height: '200px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {/* data: [{RankingID:115, WorkID:4, IssueID:0, Rank:1, RankChange:0}, ...] 
              という形式を想定 
          */}
          <AreaChart data={eachWork} margin={{ top: 10, right: 10, left: -40, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#334155" />
            
            {/* XAxis: 適切なラベル（号数など）がない場合は index を表示するか、データに項目を追加してください */}
            <XAxis 
              dataKey="issue_label" 
              reversed
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10}} 
              interval="preserveStartEnd" 
            />
            
            {/* YAxis: Rankが1に近いほど上にくるように reversed を使用 */}
            <YAxis 
              reversed 
              dataKey="rank_num" 
              domain={[1, 'dataMax + 1']} 
              hide 
            />

            <Tooltip 
              // マウスを当てた時に表示されるボックスのスタイル
              contentStyle={{ 
                backgroundColor: '#1a2235', 
                border: '1px solid #334155', 
                borderRadius: '4px',
                fontSize: '12px',
                color: '#fff'
              }}
              // 項目のスタイル
              itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
              // 表示名のカスタマイズ
              formatter={(value: number) => [`${value}位`, '順位']}
              // ラベル（X軸の値）の非表示（必要に応じて）
              labelStyle={{ display: 'none' }}
              // カーソル（マウス位置の垂直線）のスタイル
              cursor={{ stroke: '#334155', strokeWidth: 1 }}
            />
            
            <Area 
              type="monotone" 
              dataKey="rank_num" // ここを新しいフォーマットのキー「Rank」に変更
              stroke="#60a5fa" 
              fill="url(#gradBlue)" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#fff', stroke: '#60a5fa', strokeWidth: 2 }} 
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      </div>


      {/* 休載アラートセクション */}
      {mangaDetail.kyusai_flg && (
        <div style={{
          margin: '16px 0 24px 0',
          padding: '16px',
          backgroundColor: 'rgba(248, 113, 113, 0.05)', // 非常に薄い赤
          borderRadius: '12px',
          border: '1px solid rgba(248, 113, 113, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'pulse 2s infinite' // 軽く視線を引くアニメーション（任意）
        }}>
          {/* アイコン部分 */}
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={20} color="#f87171" style={{ opacity: 0.8 }} />
          </div>

          {/* テキスト部分 */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: '#f87171', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}>
              今週号では休載です
            </div>
            <p style={{ 
              fontSize: '12px', 
              color: '#94a3b8', 
              margin: '2px 0 0 0',
              lineHeight: '1.4'
            }}>
              {mangaDetail.title} は、現在発売中の週刊少年ジャンプには掲載されておりません。※次号の掲載予定は公式発表をご確認ください
            </p>
          </div>
        </div>
      )}
    

      {/* 下部のリスト */}
      <div>
        <AdBannerAdsense />
        <h2 style={{ fontSize: '14px', marginBottom: '12px' }}>号別順位</h2>
        {eachWork.slice(0, 5).map((work) => (
        <ListRow
          key={work.rank_num}
          label={work.issue_label}
          value={work.rank_num}
        />
        ))}
      </div>

      {/* 単行本情報セクション */}
      <section style={{ marginTop: '32px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '16px' }}>単行本の最新刊情報</h2>
        {volumes === null ? (
          <p>データがありません</p>
        ) : (
        volumes.map((volume) => (
          <div style={{ 
            backgroundColor: '#252b39', 
            borderRadius: '8px', 
            padding: '16px', 
            display: 'flex', 
            gap: '16px',
            border: '1px solid #334155'
          }}>
           {/* 表紙イメージのプレースホルダー */}
          <div style={{ 
            width: '80px', 
            height: '120px', 
            backgroundColor: '#1b2230', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden', // 画像が枠からはみ出さないように
            border: '1px solid #334155'
          }}>
            {volume.coverimage ? (
              <img 
                src={`https://www.shonenjump.com${volume.coverimage}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' // 比率を保って枠を埋める
                }} 
              />
            ) : (
              <span style={{ fontSize: '10px', color: '#4b5563' }}>NO IMAGE</span>
            )}
          </div>


          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{mangaDetail.title} {volume.volume}巻</h3>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{/*発売日: {new Date(volume.releaseDate).toLocaleDateString('ja-JP')}*/}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>{/*価格: {volume.price.toLocaleString()}円 (税込)*/}</div>
            
            <a 
            href={`${volume.volume_link}`}
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              display: 'block', // 幅いっぱいに広げる
              textAlign: 'center',
              textDecoration: 'none', // 下線を消す
              backgroundColor: '#2a5496', 
              color: 'white', 
              borderRadius: '4px', 
              padding: '10px 12px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            詳細を見る
          </a>
          </div>
        </div>
        ))
        )}
      </section>

    </div>

    
  );
};

// --- スタイル付きサブコンポーネント ---

const StatBox = ({ title, value, unit, color, border, icon }: any) => (
  <div style={{
    backgroundColor: color,
    border: border || 'none',
    borderRadius: '4px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    aspectRatio: '1/1'
  }}>
    <div style={{ fontSize: '9px', opacity: 0.8, textAlign: 'center' }}>{title}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
      <span style={{ fontSize: '20px', fontWeight: 'bold', fontStyle: 'italic' }}>{value}</span>
      <span style={{ fontSize: '10px' }}>{unit}</span>
      {icon && <span style={{ marginLeft: '2px' }}>{icon}</span>}
    </div>
  </div>
);

const ListRow = ({ label, value }: any) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  }}>
    <span style={{ color: '#94a3b8', fontSize: '14px' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
      <span style={{ fontSize: '18px', fontWeight: 'bold', fontStyle: 'italic' }}>{value}</span>
      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>位</span>
    </div>
  </div>
);

export default DetailPage;
