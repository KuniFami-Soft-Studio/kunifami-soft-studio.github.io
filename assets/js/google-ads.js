/**
 * 🎨 Google AdSense Manager (Ultimate Safety Edition)
 * * 【機能概要】
 * 1. セーフティ・ロック (最強の防衛機能)
 * - localhost, 127.0.0.1, または URL末尾に ?debug=true がある場合、
 * 広告リクエストを「物理的に遮断」し、代わりに枠とデバッグ情報を表示します。
 * * 2. KIDSモード (metaタグ判定)
 * - <meta name="ad-mode" content="kids"> がある場合、
 * 強制的に小型バナー(320x50)化し、余白を倍増させます。
 * * 3. CLS防止
 * - 広告がロードされる前から領域を確保し、画面ガタつきを防ぎます。
 */
(function() {
    'use strict';

    // --------------------------------------------------
    // 1. 環境設定 & 安全装置の判定
    // --------------------------------------------------
    const CONFIG = {
        // ★ここを true にすると強制的にデバッグモードになります
        // 基本は false にして、自動判定に任せるのが安全です
        FORCE_DEBUG: false, 
        CLIENT_ID: "ca-pub-5115190227060860", 
        LABEL_TEXT: "Advertisement",
    };

    // ▼ 安全装置: 開発環境判定
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isPreview = window.location.search.includes("debug=true"); // URLパラメータ判定
    
    // ▼ 広告ブロック発動フラグ (ローカル or プレビュー or 強制設定)
    // これが true の時は、Googleに一切リクエストを送りません
    const IS_DEBUG_MODE = isLocal || isPreview || CONFIG.FORCE_DEBUG;

    // ▼ モバイル判定 (768px以下)
    const isMobile = window.innerWidth <= 768;

    // ▼ KIDSモード判定: <meta name="ad-mode" content="kids"> を探す
    const adModeMeta = document.querySelector('meta[name="ad-mode"]');
    const isKidsMode = adModeMeta && adModeMeta.getAttribute('content') === 'kids';

    // --------------------------------------------------
    // 2. 広告枠の定義
    // --------------------------------------------------
    const AD_SLOTS = {
        'header': {
            id: '5049939559',
            slotName: 'Header Banner',
            // KIDSモードなら 320x50 固定
            style: isKidsMode ? 'display:inline-block; width:320px; height:50px;' :
                   isMobile   ? 'display:inline-block; width:320px; height:50px;' :
                                'display:inline-block; width:728px; height:90px;'
        },
        'article-bottom': {
            id: '6560032580',
            slotName: 'Bottom Banner',
            style: (isKidsMode || isMobile) ? 'display:inline-block; width:320px; height:50px;' :
                                              'display:inline-block; width:728px; height:90px;'
        },
        'in-article': {
            id: '3933869248',
            slotName: 'In-Article',
            style: (isKidsMode || isMobile) ? 'display:inline-block; width:320px; height:50px;' :
                                              'display:block; text-align:center;'
        }
    };

    // --------------------------------------------------
    // 3. 描画・安全対策ロジック
    // --------------------------------------------------
    
    // Googleのスクリプトを読み込む (本番のみ実行される)
    const loadAdSenseScript = () => {
        if (document.getElementById('adsense-main-script')) return;
        const script = document.createElement('script');
        script.id = 'adsense-main-script';
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.CLIENT_ID}`;
        document.head.appendChild(script);
    };

    const initAds = () => {
        const slots = document.querySelectorAll('.adsense-slot');
        
        // 開発環境ならコンソールにも通知
        if (IS_DEBUG_MODE) {
            console.log(`🛡️ AdSense Safety Lock: ON (Reason: ${isLocal ? 'Localhost' : isPreview ? 'Preview param' : 'Config'})`);
        }

        slots.forEach(slot => {
            const slotKey = slot.getAttribute('data-slot-key');
            const config = AD_SLOTS[slotKey]; 
            if (!config) return;

            // --- KIDSモード時の余白倍増設定 ---
            const marginSize = isKidsMode ? "40px" : "20px";
            
            // 外枠のスタイル適用 (CLS防止のため高さ確保)
            slot.style.cssText = `
                margin-top: ${marginSize}; 
                margin-bottom: ${marginSize}; 
                text-align: center; 
                min-height: ${isMobile ? "50px" : "90px"}; /* 最小高さを確保 */
                overflow: hidden;
            `;

            // --- ラベル生成 ---
            const label = document.createElement('div');
            label.textContent = CONFIG.LABEL_TEXT + (isKidsMode ? " (Kids Safe)" : "");
            label.style.cssText = "font-size: 10px; color: #999; margin-bottom: 6px; font-family: sans-serif;";
            
            // ==================================================
            // ★ 安全装置分岐: デバッグモードなら「枠だけ」描画して終了
            // ==================================================
            if (IS_DEBUG_MODE) {
                // 枠線の色分け (KIDS=オレンジ, 通常=赤, Local=緑)
                let borderColor = "#ea4335"; // 赤 (Default)
                let bgColor = "#fff1f0";
                
                if (isKidsMode) {
                    borderColor = "#ff9500"; // オレンジ (Kids)
                    bgColor = "#fff9e6";
                } else if (isLocal) {
                    borderColor = "#34a853"; // 緑 (Localhost)
                    bgColor = "#e6f4ea";
                }

                // デバッグ用スタイル適用
                slot.style.border = `2px dashed ${borderColor}`;
                slot.style.background = bgColor;
                slot.style.padding = "10px";
                
                // 中身をクリアして情報表示
                slot.textContent = ""; // innerHTML="" より高速
                slot.appendChild(label);
                
                const debugInfo = document.createElement('div');
                debugInfo.style.fontFamily = "monospace";
                
                // 安全なHTML生成（innerHTMLを使わずに構築）
                const title = document.createElement('div');
                title.style.fontWeight = "bold";
                title.style.color = borderColor;
                title.textContent = "🚫 AD BLOCKED (Safety Mode)";
                debugInfo.appendChild(title);

                const details = document.createElement('div');
                details.style.fontSize = "11px";
                details.style.marginTop = "5px";
                
                // 詳細情報をテキストとして追加（改行はCSSかbrタグで）
                const infoText = [
                    `Slot: ${config.slotName}`,
                    `Size: ${isMobile ? 'Mobile' : 'PC'}`,
                    `Kids: ${isKidsMode ? 'ON' : 'OFF'}`,
                    `Env: ${isLocal ? 'Localhost' : 'Preview'}`
                ];
                
                infoText.forEach(text => {
                    details.appendChild(document.createTextNode(text));
                    details.appendChild(document.createElement('br'));
                });
                
                debugInfo.appendChild(details);
                slot.appendChild(debugInfo);

                // ★ここで処理終了 (Googleにリクエストを送らない)
                return; 
            }

            // ==================================================
            // ★ 本番モード: 実際に広告タグを注入
            // ==================================================
            slot.textContent = '';
            slot.appendChild(label);

            const ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.cssText = config.style;
            ins.setAttribute('data-ad-client', CONFIG.CLIENT_ID);
            ins.setAttribute('data-ad-slot', config.id);
            
            // KIDSモード時は自動拡張を禁止
            if (isKidsMode) {
                ins.setAttribute('data-ad-format', 'false');
                ins.setAttribute('data-full-width-responsive', 'false');
            } else {
                ins.setAttribute('data-ad-format', 'auto');
                ins.setAttribute('data-full-width-responsive', 'true');
            }

            slot.appendChild(ins);

            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense Push Error:", e);
            }
        });

        // デバッグモードでなければスクリプトをロード
        if (!IS_DEBUG_MODE) {
            loadAdSenseScript();
        }
    };

    // DOM読み込み待機後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAds);
    } else {
        initAds();
    }
})();
