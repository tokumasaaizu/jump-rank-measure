import React from "react";

export default function App2() {
  return (
    <>
      <div className="container">
        <section className="hero">
          <h1>ジャンプ順位Webアプリ</h1>
          <p className="sub">
            週刊少年ジャンプの掲載順位を
            <br />
            毎週すぐにブラウザでチェック！
          </p>

          <a href="https://jump-web.app" className="ctaButton">
            今すぐ無料でアクセス
          </a>
        </section>

        <section className="preview">
          <img src="/web-preview.png" />
        </section>

        <section className="features">
          <div className="feature">
            <h3>👑 最新順位を確認</h3>
            <p>毎週更新される掲載順位をすぐにチェック</p>
          </div>

          <div className="feature">
            <h3>📈 ランキング推移</h3>
            <p>作品ごとの順位変動をグラフで分析</p>
          </div>

          <div className="feature">
            <h3>⭐ お気に入り登録</h3>
            <p>推し作品の順位変動をすぐ確認</p>
          </div>
        </section>

        <section className="cta">
          <h2>ジャンプファン必見！</h2>
          <p>登録不要・完全無料</p>

          <a href="https://jump-web.app" className="ctaButton large">
            今すぐブラウザで見る
          </a>
        </section>

        <footer>© 2026 Jump Ranking Web App</footer>
      </div>

      <style>{`
        .container{
          background:#111;
          color:white;
          text-align:center;
          min-height:100vh;
          font-family:-apple-system,BlinkMacSystemFont,sans-serif;
        }

        .hero{
          padding:100px 20px;
          background:linear-gradient(135deg,#ff3c00,#ff9900);
        }

        .hero h1{
          font-size:48px;
        }

        .sub{
          font-size:20px;
          margin-bottom:40px;
        }

        .ctaButton{
          background:black;
          color:white;
          padding:16px 32px;
          border-radius:10px;
          text-decoration:none;
          font-weight:bold;
          display:inline-block;
        }

        .preview{
          padding:60px;
          background:#222;
        }

        .preview img{
          max-width:100%;
          border-radius:16px;
        }

        .features{
          padding:80px;
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
          gap:40px;
          background:#181818;
        }

        .cta{
          padding:100px;
          background:linear-gradient(135deg,#ff0000,#ff6600);
        }

        footer{
          padding:30px;
          background:black;
        }
      `}</style>
    </>
  );
}