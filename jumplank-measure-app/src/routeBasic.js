import { Routes, Route } from "react-router-dom"; // 追加
import React, { useState } from 'react';
import Home from './home';
import NotFound from "./NotFound";

function RouteBasic () {
    return (
        <div className="App">
            {/*<Navi isauth={isauth} />*/}
            <Routes> {/*Routesで囲む*/}
                <Route path="/jumprank/" element={ <Home /> } />
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