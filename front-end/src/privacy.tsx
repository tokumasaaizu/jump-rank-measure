import React from "react";
import { ChevronLeft, ShieldCheck, Info, Eye, Lock, Mail, Scale } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * PrivacyPolicy React component
 * アプリ全体のデザイン（ダークネイビー・ブルーアクセント）に統一
 */

export default function PrivacyPolicy({
  appName = "週刊少年ジャンプ連載作品の順位管理アプリ",
  lastUpdated = "2025-10-11",
}) {
  const colors = {
    bg: '#0f172a',       // ダーク背景
    card: '#1b2230',     // セクション背景
    accent: '#3b82f6',   // ブルーアクセント
    border: '#334155',   // 境界線
    textMain: '#f1f5f9', // メイン文字
    textMuted: '#94a3b8' // 補足文字
  };

  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.textMain,
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* ヘッダー・戻るボタン */}
        <header style={{ marginBottom: '40px' }}>
          <Link to="/home" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: colors.accent, 
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <ChevronLeft size={18} /> 戻る
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <ShieldCheck size={32} color={colors.accent} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>プライバシーポリシー</h1>
          </div>
          <p style={{ color: colors.textMuted, fontSize: '14px' }}>
            {appName} / 最終更新日: {lastUpdated}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* イントロダクション */}
          <SectionCard>
            <p style={{ lineHeight: '1.8', margin: 0 }}>
              当アプリは、ユーザーのプライバシーを重要視しています。本プライバシーポリシーは、当アプリがどのような情報を収集し、どのように利用・管理するかを説明するものです。
            </p>
          </SectionCard>

          {/* 各セクション */}
          <PolicySection icon={<Info size={20}/>} title="適用範囲 & 定義">
            <p>本ポリシーは当アプリが提供するウェブサービス（以下「本サービス」）に適用されます。</p>
            <ul style={listStyle}>
              <li><strong>個人情報</strong>: 氏名、メールアドレス等、特定の個人を識別できる情報。</li>
              <li><strong>非個人情報</strong>: 個人を特定できない利用統計や端末情報など。</li>
            </ul>
          </PolicySection>

          <PolicySection icon={<Eye size={20}/>} title="収集する情報">
            <h3 style={subTitleStyle}>1. ユーザー提供情報</h3>
            <p>問い合わせやフィードバック送信時に、メールアドレス等を取得することがあります。</p>
            <h3 style={subTitleStyle}>2. 利用情報（ログ）</h3>
            <p>アクセス日時、利用した機能、IPアドレスの一部、デバイス情報を自動的に収集します。これらはサービス改善や悪用検知のために利用します。</p>
            <h3 style={subTitleStyle}>3. Cookie・類似技術</h3>
            <p>セッション管理や解析のためにCookieを使用することがあります。ブラウザ設定で拒否可能ですが、一部機能に影響が出る場合があります。</p>
          </PolicySection>

          <PolicySection icon={<Scale size={20}/>} title="利用目的 & 第三者提供">
            <ol style={listStyle}>
              <li>本サービスの提供・維持・改善のため</li>
              <li>利用状況の分析、機能改善のため</li>
              <li>問い合わせへの対応のため</li>
              <li>法令に基づく対応のため</li>
            </ol>
            <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '16px 0' }} />
            <p>原則として第三者に個人情報を提供することはありません。ただし、ユーザーの同意がある場合や、法令に基づく開示が必要な場合を除きます。</p>
          </PolicySection>

          <PolicySection icon={<Lock size={20}/>} title="データの保護と権利">
            <p>情報の漏えい・不正アクセスを防ぐために合理的な安全対策を講じます。ユーザーは、自己の個人情報について開示、訂正、削除等を求める権利を有します。</p>
          </PolicySection>

          <PolicySection icon={<Mail size={20}/>} title="お問い合わせ">
            <p>本ポリシーに関するご質問は下記までご連絡ください。</p>
            <div style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              padding: '16px', 
              borderRadius: '8px',
              border: `1px solid ${colors.accent}`,
              marginTop: '12px'
            }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>{appName} サポート</strong>
              <a href="https://x.com/jump_rank" target="_blank" rel="noreferrer" style={{ color: colors.accent, textDecoration: 'none', fontSize: '14px' }}>
                開発者のX (旧Twitter) へDM
              </a>
            </div>
          </PolicySection>

        </div>

     
      </div>
    </div>
  );
}

// --- サブコンポーネント & スタイル ---

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <section style={{
    backgroundColor: '#1b2230',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #334155',
    lineHeight: '1.7',
    fontSize: '15px',
    color: '#cbd5e1'
  }}>
    {children}
  </section>
);

const PolicySection = ({ icon, title, children }: any) => (
  <SectionCard>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f1f5f9' }}>
      <span style={{ color: '#3b82f6' }}>{icon}</span>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ color: '#94a3b8' }}>
      {children}
    </div>
  </SectionCard>
);

const listStyle = {
  paddingLeft: '20px',
  marginTop: '8px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px'
};

const subTitleStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#f1f5f9',
  marginTop: '16px',
  marginBottom: '4px'
};