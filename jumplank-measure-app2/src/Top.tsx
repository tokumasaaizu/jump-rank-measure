import React from "react";
import { Link } from 'react-router-dom';

export default function App3() {
  const sampleRanking = [
    { rank: 1, title: "ONE PIECE" },
    { rank: 2, title: "呪術廻戦" },
    { rank: 3, title: "SAKAMOTO DAYS" },
    { rank: 4, title: "僕のヒーローアカデミア" },
    { rank: 5, title: "アオのハコ" }
  ];

  const popularWorks = [
    "ONE PIECE",
    "呪術廻戦",
    "SAKAMOTO DAYS",
    "アオのハコ",
    "僕のヒーローアカデミア",
    "逃げ上手の若君"
  ];

  return (
    <>
      <div className="container">

        {/* HERO */}
        <section className="hero">
          <h1>ジャンプ順位Webアプリ</h1>
          <p>
            週刊少年ジャンプの掲載順位を  
            <br />
            毎週リアルタイムでチェック
          </p>

          <Link to="/home" className="cta">今すぐランキングを見る</Link>
        </section>

        {/* 最新順位 */}
        <section className="ranking">
          <h2>📖 最新ジャンプ掲載順位</h2>

          <div className="rankingTable">
            {sampleRanking.map((r) => (
              <div className="row" key={r.rank}>
                <span className="rank">{r.rank}</span>
                <span>{r.title}</span>
              </div>
            ))}
          </div>

          <p className="note">
            ※実際のランキングはアプリ内で毎週更新
          </p>
        </section>

        {/* グラフ */}
        <section className="graph">
          <h2>📈 順位推移をグラフで分析</h2>

          <div className="graphMock">
            <div className="bar" style={{ height: 80 }} />
            <div className="bar" style={{ height: 120 }} />
            <div className="bar" style={{ height: 60 }} />
            <div className="bar" style={{ height: 140 }} />
            <div className="bar" style={{ height: 100 }} />
          </div>

          <p>
            推し作品の掲載順位がどう変化しているか  
            一目で分かります
          </p>
        </section>

        {/* 人気作品 */}
        <section className="popular">
          <h2>🔥 人気作品ランキング</h2>

          <div className="works">
            {popularWorks.map((w) => (
              <div className="work" key={w}>
                {w}
              </div>
            ))}
          </div>
        </section>

        {/* 機能 */}
        <section className="features">
          <h2>✨ 主な機能</h2>

          <div className="featureGrid">
            <div>
              <h3>📊 順位履歴</h3>
              <p>過去の掲載順位をすべて確認</p>
            </div>

            {/**<div>
              <h3>⭐ お気に入り登録</h3>
              <p>推し作品の順位を追跡</p>
            </div>
            */}
            <div>
              <h3>📘 号別ランキング</h3>
              <p>ジャンプ各号の順位を確認</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="ctaSection">
          <h2>ジャンプファン必見</h2>
          <p>完全無料・登録不要</p>

          {/**<a href="%PUBLIC_URL%/home" className="cta big">
            今すぐランキングを見る
          </a>*/}
          <Link to="/home" className="cta big">今すぐランキングを見る</Link>
        </section>

        <footer>
          © 2026 Jump Ranking Web App
        </footer>

      </div>

      <style>{`

      .container{
        font-family:-apple-system,BlinkMacSystemFont,sans-serif;
        background:#111;
        color:white;
        text-align:center;
      }

      section{
        padding:80px 20px;
      }

      h1{
        font-size:52px;
      }

      h2{
        font-size:32px;
        margin-bottom:30px;
      }

      /* hero */

      .hero{
        background:linear-gradient(135deg,#ff3c00,#ff9900);
      }

      .hero p{
        font-size:20px;
        margin:30px 0;
      }

      /* button */

      .cta{
        background:black;
        color:white;
        padding:16px 32px;
        border-radius:10px;
        text-decoration:none;
        font-weight:bold;
        display:inline-block;
      }

      .cta.big{
        font-size:20px;
        padding:20px 40px;
      }

      /* ranking */

      .ranking{
        background:#1a1a1a;
      }

      .rankingTable{
        max-width:400px;
        margin:auto;
      }

      .row{
        display:flex;
        justify-content:space-between;
        padding:12px 20px;
        border-bottom:1px solid #333;
      }

      .rank{
        font-weight:bold;
        color:#ff9900;
      }

      /* graph */

      .graphMock{
        display:flex;
        justify-content:center;
        gap:12px;
        margin:40px 0;
      }

      .bar{
        width:40px;
        background:#ff6a00;
        border-radius:6px;
      }

      /* works */

      .works{
        display:flex;
        flex-wrap:wrap;
        justify-content:center;
        gap:12px;
      }

      .work{
        background:#222;
        padding:10px 18px;
        border-radius:8px;
      }

      /* features */

      .featureGrid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:40px;
        max-width:900px;
        margin:auto;
      }

      /* CTA */

      .ctaSection{
        background:linear-gradient(135deg,#ff0000,#ff6600);
      }

      footer{
        padding:40px;
        background:black;
        font-size:14px;
      }

      `}</style>
    </>
  );
}