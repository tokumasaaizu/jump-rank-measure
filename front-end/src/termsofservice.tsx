import React from "react";
import { ChevronLeft, Gavel, UserCheck, AlertTriangle, Ban, HelpCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService({
  appName = "週刊少年ジャンプ連載作品の順位管理アプリ",
  lastUpdated = "2026-03-07",
}) {
  const colors = {
    bg: '#0f172a',
    card: '#1b2230',
    accent: '#3b82f6',
    danger: '#ef4444',
    border: '#334155',
    textMain: '#f1f5f9',
    textMuted: '#94a3b8'
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
        
        {/* ヘッダー */}
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
            <Gavel size={32} color={colors.accent} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>利用規約</h1>
          </div>
          <p style={{ color: colors.textMuted, fontSize: '14px' }}>
            {appName} / 最終更新日: {lastUpdated}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <SectionCard>
            <p style={{ lineHeight: '1.8', margin: 0 }}>
              この利用規約（以下「本規約」）は、ユーザーの皆様に当アプリを安心してご利用いただくためのルールを定めたものです。本サービスを利用することで、本規約に同意したものとみなされます。
            </p>
          </SectionCard>

          {/* 第1条：利用合意 */}
          <TermsSection icon={<UserCheck size={20}/>} title="第1条 利用の同意">
            <p>ユーザーは、本規約に従って本サービスを利用するものとします。未成年の方が利用される場合は、保護者等の法定代理人の同意を得た上でご利用ください。</p>
          </TermsSection>

          {/* 第2条：禁止事項 */}
          <TermsSection icon={<Ban size={20} color={colors.danger}/>} title="第2条 禁止事項">
            <p>以下の行為を禁止します。これらの行為が確認された場合、利用停止等の措置をとることがあります。</p>
            <ul style={listStyle}>
              <li>サーバーやネットワークに過度な負荷をかける行為（不正なスクレイピング等）</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他のユーザーになりすます行為</li>
              <li>本サービスのデータを、出典を明記せずに商用転載する行為</li>
              <li>その他、開発者が不適切と判断する行為</li>
            </ul>
          </TermsSection>

          {/* 第3条：免責事項 */}
          <TermsSection icon={<AlertTriangle size={20}/>} title="第3条 免責事項">
            <p>当アプリは、細心の注意を払ってデータを提供していますが、以下の点について保証するものではありません。</p>
            <ul style={listStyle}>
              <li>データの正確性、完全性、最新性（手入力や自動取得による誤差の可能性）</li>
              <li>本サービスの中断・停止・不具合が発生しないこと</li>
              <li>本サービスの利用により生じた損害（直接・間接を問いません）</li>
            </ul>
          </TermsSection>

          {/* 第4条：サービス内容の変更 */}
          <TermsSection icon={<RefreshCw size={20}/>} title="第4条 変更と停止">
            <p>本サービスは、ユーザーへの事前通知なく、内容の変更、追加、または提供の停止を行うことができるものとします。</p>
          </TermsSection>

          {/* 第5条：規約の変更 */}
          <TermsSection icon={<HelpCircle size={20}/>} title="第5条 規約の変更">
            <p>本規約は、必要に応じていつでも変更できるものとします。変更後の規約は、本サービス上に掲示した時点から効力を生じるものとします。</p>
          </TermsSection>

          <TermsSection icon={<RefreshCw size={20}/>} title="第6条 準拠法・裁判管轄">
            <p>本規約の解釈にあたっては日本法を準拠法とし、本サービスに関して紛争が生じた場合には、開発者の所在地を管轄する裁判所を専属的合意管轄とします。</p>
          </TermsSection>

        </div>


      </div>
    </div>
  );
}

// --- サブコンポーネント ---

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

const TermsSection = ({ icon, title, children }: any) => (
  <SectionCard>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f1f5f9' }}>
      <span style={{ display: 'flex' }}>{icon}</span>
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