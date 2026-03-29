import React, { useEffect } from 'react';

const AdBannerAdsense = () => {
  // useEffectの中を以下のように書き換える
    useEffect(() => {
    try {
        // window を any 型として扱うことでエラーを回避
        const { adsbygoogle } = window as any;
        if (adsbygoogle) {
        adsbygoogle.push({});
        }
    } catch (e) {
        console.error("AdSense error:", e);
    }
    }, []);

  return (
    <div 
      className="ad-container" 
      style={{ textAlign: 'center', margin: '20px 0', minHeight: '280px' }}
    >
      <ins
        className="xxxx"
        style={{ display: 'block' }}
        data-ad-client="xxxx"
        data-ad-slot="xxxx"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBannerAdsense;
