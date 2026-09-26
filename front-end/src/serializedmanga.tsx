import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Container,
  Chip,
  Box,
  CardActionArea
} from '@mui/material';
import { 
  Home, List, BookOpen, Database, Menu, X, ChevronLeft, ChevronRight, ArrowRight, ChevronDown 
} from 'lucide-react';
import Grid from '@mui/material/Grid';
import Footer from "./components/Footer/footer";
import { Link as RouterLink } from 'react-router-dom';

//import Link from "@mui/material/Link";
import { Link, useLocation } from 'react-router-dom';


interface Works {
    work_id: number;
    title: string;
    author: string;
    image_url: string;
    serialization_start_date: Date;
}

const SerializedManga: React.FC = () => {
  const [posts, setPosts] = useState<Works[]>([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);

    // Goで構築したAPIへの通信
    fetch('/works')
    .then((response) => {
      if (!response.ok) {
        throw new Error('API error');
      }
      return response.json();
    })
    .then((data) => {
      // Goが配列を直接返す場合
      setPosts(data);
      // もし { posts: [...] } の形なら ↓ に変更
      // setPosts(data.posts);
      setIsLoading(false);
    })
    .catch((err) => {
      console.error('Error loading works:', err);
      setError(err.message);
      setIsLoading(false);
    });


  }, []); // useEffect

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

  if (isLoading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  return (
    /* 全体のコンテナ：背景色を強制的に指定 */
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
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.2em', marginLeft:'70px' }}>連載作品</h1>
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

        {/* 単行本情報セクション */}
        <section style={{ marginTop: '32px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '16px' }}>連載作品の情報</h2>
          {posts.map((post,i) => (
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
            {post.image_url ? (
              <img 
                src={post.image_url} 
                alt={post.title} 
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
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{post.title}</h3>            
          <Link 
            to={`/detail?title=${encodeURIComponent(post.title)}`} 
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
          </Link>
          </div>
        </div>
))}

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


export default SerializedManga;