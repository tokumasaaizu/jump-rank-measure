import React, { useState } from 'react';

export default function NotFound(){
    //ログイン中かどうかを判定。ログイン中じゃないとRouteしたくないページを制限できたりする
    return (
        <>
            <div>
                <h3>お探しのページは存在しません。</h3>
            </div>
        </>
    );
}