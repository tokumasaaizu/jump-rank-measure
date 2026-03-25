import { Routes, Route } from "react-router-dom"; // 追加
import React, { useState } from 'react';
import Home from './home';
import News from './news';
import SerializedManga from "./serializedmanga";
import DetailPage from "./detailpage";
import AdminRankingPage from "./rankingedit";
import PrivacyPolicy from "./privacy";
import TermsOfService from "./termsofservice";
import IssueRanking from "./issueRanking";
import NotFound from "./NotFound";
import App from "./App.tsx";
import App2 from "./App2.tsx";
import Top from "./Top.tsx";

function RouteBasic () {
    return (
        <div className="App">
            {/*<Navi isauth={isauth} />*/}
            <Routes> {/*Routesで囲む*/}
                {/**
                <Route path="/jumprank/top" element={ <App3 /> } />
                <Route path="/jumprank/" element={ <Home /> } />
                <Route path="/jumprank/news/" element={ <News /> } />
                <Route path="/jumprank/series/" element={ <SerializedManga /> } />
                <Route path="/jumprank/detail/" element={ <DetailPage /> } />
                <Route path="/jumprank/privacy/" element={ <PrivacyPolicy /> } />
                <Route path="/jumprank/terms/" element={ <TermsOfService /> } />
                <Route path="/jumprank/issue" element={ <IssueRanking /> } />
                <Route path="/jumprank/admin/" element={ <AdminRankingPage /> } />
                <Route path="*" element={<NotFound />} />
                 */}
                <Route path="/" element={ <Top /> } />
                <Route path="/home" element={ <Home /> } />
                <Route path="/news" element={ <News /> } />
                <Route path="/series" element={ <SerializedManga /> } />
                <Route path="/detail" element={ <DetailPage /> } />
                <Route path="/privacy" element={ <PrivacyPolicy /> } />
                <Route path="/terms" element={ <TermsOfService /> } />
                <Route path="/issue" element={ <IssueRanking /> } />
                <Route path="/admin" element={ <AdminRankingPage /> } />
                <Route path="*" element={<NotFound />} />
                
            </Routes>
        </div>
    );
}

export default RouteBasic;

/** ルーティングテーブルの定義の仕方
 * const routeBacis = createBrowserRouter([
    { path: '/top', element: <TopPage /> },
]);
 */