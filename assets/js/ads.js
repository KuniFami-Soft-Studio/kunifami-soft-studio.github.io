/* ========================================================
 * ads.js - 広告管理システム (セキュリティ対策済・審査対応版)
 * 保存場所: js/ads.js
 * ======================================================== */

(function() { // 即時関数で囲み、変数が外部に漏れないように保護
    'use strict'; // 厳格モードを有効化

    document.addEventListener('DOMContentLoaded', () => {
        // ==========================================
        // 1. マスター設定
        // ==========================================
        const CONFIG = {
            // ★審査中は必ず true にしてください！
            // false にすると、Googleがサイトを見つけられず審査に落ちます。
            IS_ENABLED: true,

            // あなたのパブリッシャーID
            CLIENT_ID: "ca-pub-5115190227060860"
        };

        // ==========================================
        // 2. ページ設定の読み取り (HTMLヘッダーから)
        // ==========================================
        
        // <meta name="ad-mode" content="..."> を探す
        const metaMode = document.querySelector('meta[name="ad-mode"]');
        
        // 設定がない場合は、安全のため 'none' (広告なし) として扱う
        const mode = metaMode ? (metaMode.getAttribute('content') || 'none') : 'none';

        // ==========================================
        // 3. 動作判定
        // ==========================================

        // マスター設定がOFF、またはページ設定が 'none' なら何もしない（終了）
        if (!CONFIG.IS_ENABLED || mode === 'none') {
            // console.log(`Ads: OFF (Mode: ${mode})`); // 本番環境用にログはコメントアウト
            return;
        }

        // ==========================================
        // 4. AdSense本体コードの生成 (身分証明書)
        // ==========================================
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.CLIENT_ID}`;
        script.async = true;
        script.crossOrigin = "anonymous";

        // モード別の安全対策 (COPPA対応)
        if (mode === 'kids') {
            // Kidsモード：法律遵守のため「子供向けフラグ」を強制付与
            script.setAttribute('data-tag-for-child-directed-treatment', 'true');
            // console.log('Ads: Kids Mode (COPPA Tag Added)');
        } else {
            // Generalモード：通常読み込み
            // console.log('Ads: General Mode (Standard)');
        }

        // HTMLのヘッダーにスクリプトを注入（これで審査ロボットに見つかります）
        document.head.appendChild(script);

        // ==========================================
        // 5. 記事内広告（手動配置）の自動展開
        // ==========================================
        // HTML内に <div class="ad-spacer" data-slot="123..."></div> があれば広告に変換
        
        const adSlots = document.querySelectorAll('.ad-spacer');
        adSlots.forEach(slot => {
            const slotId = slot.getAttribute('data-slot'); // ユニットIDを取得
            
            // IDが設定されていれば広告を表示
            if (slotId) {
                // DOM操作で安全に <ins> タグを生成
                const ins = document.createElement('ins');
                ins.className = "adsbygoogle";
                ins.style.display = "block";
                ins.setAttribute('data-ad-client', CONFIG.CLIENT_ID);
                ins.setAttribute('data-ad-slot', slotId);
                ins.setAttribute('data-full-width-responsive', 'true');
                
                slot.appendChild(ins);
                
                // 広告読み込みトリガー (エラーハンドリング付き)
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    // console.error(e); // エラーログも必要に応じて抑制
                }
            }
        });
    });
})();
