import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle, ChevronLeft, Search } from 'lucide-react';

export default function NotFound() {
  const colors = {
    bg: '#0f172a',       // ダーク背景
    accent: '#3b82f6',   // ブルー
    textMuted: '#94a3b8',
    textMain: '#f1f5f9',
    border: '#1e293b'
  };

  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.textMain,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      {/* メインのビジュアルエリア */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '120px', 
          fontWeight: '900', 
          margin: 0, 
          opacity: 0.05,
          letterSpacing: '-0.05em'
        }}>
          404
        </h1>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <AlertCircle size={64} color={colors.accent} style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            ページが見つかりません
          </h2>
        </div>
      </div>

      {/* テキストメッセージ */}
      <div style={{ maxWidth: '400px', marginBottom: '40px' }}>
        <p style={{ color: colors.textMuted, lineHeight: '1.6', fontSize: '15px' }}>
          お探しのページは削除されたか、URLが変更された可能性があります。<br />
          入力したアドレスが正しいか再度ご確認ください。
        </p>
      </div>

      {/* アクションボタン */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
        <Link 
          to="/home" 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: colors.accent,
            color: 'white',
            textDecoration: 'none',
            padding: '14px 24px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '15px',
            transition: 'transform 0.2s, background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors.accent;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Home size={18} />
          ホームに戻る
        </Link>

        <Link 
          to="/issue" 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            color: colors.textMuted,
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            border: `1px solid ${colors.border}`
          }}
        >
          <Search size={16} />
          号別ランキングを探す
        </Link>
      </div>

    </div>
  );
}