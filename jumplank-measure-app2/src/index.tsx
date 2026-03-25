import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import {RouterProvider, BrowserRouter} from 'react-router-dom';
import './index.css';
import RouteBasicver from './routeBasic.js';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    // basename="/jumprank" を追加
    /**
     * すべてのパスが /jumprank/ から始まるのであれば、BrowserRouter に basename を指定する必要があります。
     * これがないと、React はドメイン直下（/）からのパスを探してしまい、不一致が起きます。
     */
    <BrowserRouter basename="/jumprank">
        <RouteBasicver />
    </BrowserRouter>
);

reportWebVitals();
