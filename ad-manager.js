/**
 * 広告・上達支援コンテンツ管理マネージャー (../ad-manager.js)
 * 機能：1件ランダムバナー + 5件ランダムリスト + 折りたたみ表示
 * 対応：テキストリンク形式 / HTML直接記述形式（A8タグ用）
 */

(function() {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userLang = navigator.language || navigator.userLanguage;
    
    let region = 'x'; 
    if (userTimeZone.includes('Tokyo') || userLang.includes('ja')) {
        region = 'jp';
    } else if (userTimeZone.includes('America') || userLang.includes('en-US')) {
        region = 'us';
    }

    const adData = {
        // --- 日本向け (JP) ---
        jp: {
            message: "新しい自分、新しい世界への第一歩をここから。<br><small>Step into a new world and a new you from here.</small>",
            // 提案（バナー用）
            suggestions: [
                '⛳️ AI解析で限界を感じたら、プロの視点で答え合わせ<br><small>Struggling with self-analysis? Get professional feedback.</small>',
                '🚀 独学を加速させる。高品質な指導を体験する<br><small>Accelerate your self-study with high-quality coaching.</small>',
                '📱 安定撮影が上達の近道。推奨スタンドを見る<br><small>Stable recording is the shortcut to improvement.</small>',
                '☕️ ツールを気に入ったら開発を支援する<br><small>If you like this tool, please support the developer.</small>'
            ],
            // リソース（リスト用）
            // text/sub/url形式: サイトのデザインに合わせて整形されます
            // html形式: A8などのタグをそのまま表示します
            resources: [
                // 1. 軽量スマホ三脚
                { text: '🔭 軽量スマホ三脚', sub: '基本の1本。練習場など地面から全身を撮るのに最適。', url: 'https://amzn.to/4sRh7G4' },
                // 2. くねくね三脚
                { text: '🐙 くねくね三脚', sub: '柱に巻き付けたり、卓上に置ける便利な小型タイプ。', url: 'https://amzn.to/3NPKdFu' },
                // 3. 広角レンズ
                { text: '📷 広角レンズ', sub: '狭い室内でも全身が映る！クリップ式広角レンズ。', url: 'https://amzn.to/4sNsn63' },
                // 4. ピアノ教室 (A8)
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+CL2W4Y+3H64+61Z82" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">🎹 楽器がもらえるピアノ教室<br><small style="color:#888; font-size:10px;">Music School</small></a><img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=4AV9KC+CL2W4Y+3H64+61Z82" alt="">' },
                // 5. CLOUD GYM (A8)
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+BUVTIQ+4RUO+5Z6WY" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">🧬 今話題の遺伝子ダイエット【CLOUD GYM】<br><small style="color:#888; font-size:10px;">Online Gym</small></a><img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4AV9KC+BUVTIQ+4RUO+5Z6WY" alt="">' },
                // 6. スポともダンス (A8)
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+AO0LYQ+4QI2+5ZEMQ" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">💃 継続率98%のオンラインダンスレッスン【スポとも】<br><small style="color:#888; font-size:10px;">Dance Lesson</small></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4AV9KC+AO0LYQ+4QI2+5ZEMQ" alt="">' },
                // 7. サンクチュアリゴルフ (A8)
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+AJUKQA+3BTW+5YJRM" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">⛳️ 初心者専用ゴルフスクール【サンクチュアリ】<br><small style="color:#888; font-size:10px;">Golf School</small></a><img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4AV9KC+AJUKQA+3BTW+5YJRM" alt="">' },
                // 8. RIZAP GOLF (A8)
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+AG9Z3M+CW6+BF23HE" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">⛳️ RIZAP GOLF<br><small style="color:#888; font-size:10px;">Pro Golf Lesson</small></a><img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=4AV9KC+AG9Z3M+CW6+BF23HE" alt="">' },
                // 開発支援
                { text: '☕️ 開発を支援する (Buy Me a Coffee)', sub: 'Support the developer', url: 'https://buymeacoffee.com/kunifami20w' }
            ]
        },
        
        // --- アメリカ向け (US) ---
        us: {
            message: "Take your first step toward a new level today.<br><small>今日、新しいレベルへの第一歩を踏み出しましょう。</small>",
            suggestions: [
                '☕️ Love this tool? Buy me a coffee!'
            ],
            resources: [
                { text: '☕️ 開発を支援する (Buy Me a Coffee)', sub: 'Support the developer', url: 'https://buymeacoffee.com/kunifami20w' }
            ]
        },
        
        // --- その他グローバル (X) ---
        x: {
            message: "Start your journey to mastery right here.",
            suggestions: [
                '☕️ Keep this project alive! Buy me a coffee.'
            ],
            resources: [
                { text: '☕️ 開発を支援する (Buy Me a Coffee)', sub: 'Support the developer', url: 'https://buymeacoffee.com/kunifami20w' }
            ]
        }
    };

    const currentData = adData[region];

    // 1. ポジティブメッセージ
    const msgArea = document.getElementById('positiveMessage');
    if (msgArea) msgArea.innerHTML = currentData.message;

    // 2. バナー（1件ランダム）
    const suggestionArea = document.getElementById('randomSuggestion');
    if (suggestionArea && currentData.suggestions.length > 0) {
        suggestionArea.innerHTML = currentData.suggestions[Math.floor(Math.random() * currentData.suggestions.length)];
    }

    // 3. リソースリスト（5件ランダム + 折りたたみ）
    const resourceList = document.getElementById('resourceList');
    if (resourceList) {
        // シャッフル
        const shuffled = [...currentData.resources].sort(() => 0.5 - Math.random());
        
        const top5 = shuffled.slice(0, 5);
        const others = shuffled.slice(5);

        let html = '<p style="font-size: 10px; color: #999; margin-bottom: 8px; text-transform: uppercase;">Recommended</p>';
        
        // アイテム生成関数（HTMLタグ直接指定に対応）
        const createItem = (item) => {
            if (item.html) {
                // A8などのHTMLタグが指定されている場合
                return `<li style="margin-bottom: 12px;">${item.html}</li>`;
            } else {
                // 通常のテキストリンク形式
                return `<li style="margin-bottom: 12px;">
                    <a href="${item.url}" target="_blank" style="color: #007AFF; text-decoration: none; font-weight: 500;">
                        ${item.text}<br><small style="color: #888; font-size: 10px; font-weight: normal;">${item.sub}</small>
                    </a>
                </li>`;
            }
        };

        // 最初の5件
        top5.forEach(item => {
            html += createItem(item);
        });

        // 6件目以降がある場合は折りたたむ
        if (others.length > 0) {
            html += `
            <details style="margin-top: 10px;">
                <summary style="font-size: 12px; color: #007AFF; cursor: pointer; font-weight: bold; outline: none; padding: 5px 0;">
                    ▼ もっと見る / View More
                </summary>
                <div style="margin-top: 10px; padding-left: 5px; border-left: 2px solid #eee;">
            `;
            others.forEach(item => {
                html += createItem(item);
            });
            html += `</div></details>`;
        }

        resourceList.innerHTML = html;
    }
})();
