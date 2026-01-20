/**
 * 広告・上達支援コンテンツ管理マネージャー
 * 機能：1件ランダムバナー + 5件ランダムリスト + 折りたたみ表示
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
        jp: {
            message: "新しい自分、新しい世界への第一歩をここから。<br><small>Step into a new world and a new you from here.</small>",
            // 提案（バナー用）
            suggestions: [
                '⛳️ AI解析で限界を感じたら、プロの視点で答え合わせ<br><small>Struggling with self-analysis? Get professional feedback.</small>',
                '🚀 独学を加速させる。高品質な指導を体験する<br><small>Accelerate your self-study with high-quality coaching.</small>',
                '📱 安定撮影が上達の近道。推奨スタンドを見る<br><small>Stable recording is the shortcut to improvement. View recommended gear.</small>',
                '☕️ ツールを気に入ったら開発を支援する<br><small>If you like this tool, please support the developer.</small>'
            ],
            // リソース（リスト用：多めに登録しておくと折りたたみが機能します）
            resources: [
                { text: '⛳️ プロによるスイング診断・体験レッスン', sub: 'Professional Swing Diagnosis', url: '#' },
                { text: '📱 推奨スマホスタンド・三脚 (Amazon)', sub: 'Recommended Tripods', url: 'https://www.amazon.co.jp/s?k=ゴルフ+三脚+スマホ' },
                { text: '📏 スイングプレーン確認用スティック', sub: 'Alignment Sticks', url: '#' },
                { text: '🎾 自宅でできるインパクト矯正器具', sub: 'Impact Training Gear', url: '#' },
                { text: '👟 スイングを安定させる専用ソックス', sub: 'Golf Support Socks', url: '#' },
                { text: '📖 100切り達成のためのメンタル読本', sub: 'Mental Training Book', url: '#' },
                { text: '☕️ 開発を支援する (Buy Me a Coffee)', sub: 'Support the developer', url: 'https://buymeacoffee.com/kunifami20w' }
            ]
        },
        us: {
            message: "Take your first step toward a new level today.<br><small>今日、新しいレベルへの第一歩を踏み出しましょう。</small>",
            suggestions: [
                '⛳️ Pro feedback is the key to breaking through limits.',
                '📱 Get the best tripod for your swing analysis.',
                '☕️ Love this tool? Buy me a coffee!'
            ],
            resources: [
                { text: '⛳️ Find Best Golf Schools in US', sub: 'US Golf Schools', url: '#' },
                { text: '📱 Best-selling Tripods for iPhone', sub: 'iPhone Tripods', url: '#' },
                { text: '☕️ Support the Developer', sub: 'Buy Me a Coffee', url: 'https://buymeacoffee.com/kunifami20w' }
            ]
        },
        x: {
            message: "Start your journey to mastery right here.",
            suggestions: [
                '🚀 Improve faster with expert guidance.',
                '☕️ Keep this project alive! Buy me a coffee.'
            ],
            resources: [
                { text: '📱 Recommended Gear on Amazon', sub: 'Amazon Gear', url: '#' },
                { text: '☕️ Support via Buy Me a Coffee', sub: 'Support', url: 'https://buymeacoffee.com/kunifami20w' }
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
        
        // 最初の5件
        top5.forEach(item => {
            html += `<li style="margin-bottom: 12px;">
                <a href="${item.url}" target="_blank" style="color: #007AFF; text-decoration: none; font-weight: 500;">
                    ${item.text}<br><small style="color: #888; font-size: 10px; font-weight: normal;">${item.sub}</small>
                </a>
            </li>`;
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
                html += `<li style="margin-bottom: 12px;">
                    <a href="${item.url}" target="_blank" style="color: #007AFF; text-decoration: none; font-weight: 500;">
                        ${item.text}<br><small style="color: #888; font-size: 10px; font-weight: normal;">${item.sub}</small>
                    </a>
                </li>`;
            });
            html += `</div></details>`;
        }

        resourceList.innerHTML = html;
    }
})();
