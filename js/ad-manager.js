/**
 * 広告・上達支援コンテンツ管理マネージャー (../ad-manager.js)
 * * ■ 機能
 * 1. 確率調整付きバナー (prob: 0.0〜1.0)
 * 2. カテゴリー（タグ）による出し分け (tags: ['golf', 'dance'])
 * 3. ランダムリスト表示 + もっと見る
 * * ■ 呼び出し方法（HTML側）
 * <script src="../js/ad-manager.js" data-tags="golf, sport" defer></script>
 * ※ data-tags 属性で、そのページに関連するタグをカンマ区切りで指定します。
 * * ■ データ設定仕様
 * - text: 表示テキスト
 * - url: リンク先URL
 * - sub: サブテキスト（説明文）
 * - html: A8などのHTMLタグを直接貼る場合に使用
 * - prob: 表示確率 (0.0〜1.0)。省略時は 1.0 (100%)。
 * - tags: 関連するタグの配列。例: ['golf', 'dance']。省略時は「全般」扱い。
 */

(function() {
    // --- 1. ユーザー環境判定 ---
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userLang = navigator.language || navigator.userLanguage;
    
    let region = 'x'; 
    if (userTimeZone.includes('Tokyo') || userLang.includes('ja')) {
        region = 'jp';
    } else if (userTimeZone.includes('America') || userLang.includes('en-US')) {
        region = 'us';
    }

    // --- 2. 呼び出し元のタグ設定を取得 ---
    // <script ... data-tags="golf,dance"> から取得
    const scriptTag = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    const pageTags = (scriptTag.getAttribute('data-tags') || '').split(',').map(t => t.trim()).filter(t => t);

    // --- 3. データ定義 ---
    const adData = {
        // --- 日本向け (JP) ---
        jp: {
            message: "新しい自分、新しい世界への第一歩をここから。<br><small>Step into a new world and a new you from here.</small>",
            
            // 提案（バナー用）
            suggestions: [
                { 
                    text: '⛳️ AI解析で限界を感じたら、プロの視点で答え合わせ', 
                    prob: 1.0, 
                    tags: ['golf'] 
                },
                { 
                    text: '💃 自分のダンスを客観的に見る。プロのフィードバック', 
                    prob: 1.0, 
                    tags: ['dance'] 
                },
                { 
                    text: '🚀 独学を加速させる。高品質な指導を体験する', 
                    prob: 1.0, 
                    tags: [] // 全般
                },
                { 
                    text: '☕️ ツールを気に入ったら開発を支援する', 
                    prob: 0.3, 
                    tags: [] 
                }
            ],

            // リソース（リスト用）
            resources: [
                // === 撮影機材 (全般) ===
                { text: '🔭 軽量スマホ三脚', sub: '基本の1本。練習場など地面から全身を撮るのに最適。', url: 'https://amzn.to/4sRh7G4', prob: 1.0, tags: ['camera', 'golf', 'dance', 'baseball'] },
                { text: '🐙 くねくね三脚', sub: '柱に巻き付けたり、卓上に置ける便利な小型タイプ。', url: 'https://amzn.to/3NPKdFu', prob: 0.8, tags: ['camera', 'golf', 'dance'] },
                { text: '📷 広角レンズ', sub: '狭い室内でも全身が映る！クリップ式広角レンズ。', url: 'https://amzn.to/4sNsn63', prob: 1.0, tags: ['camera', 'dance', 'yoga'] },

                // === 音楽・ピアノ ===
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+CL2W4Y+3H64+61Z82" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">🎹 楽器がもらえるピアノ教室<br><small style="color:#888; font-size:10px;">Music School</small></a><img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=4AV9KC+CL2W4Y+3H64+61Z82" alt="">', prob: 1.0, tags: ['music', 'piano'] },

                // === ダイエット・ヨガ ===
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+BUVTIQ+4RUO+5Z6WY" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">🧬 今話題の遺伝子ダイエット【CLOUD GYM】<br><small style="color:#888; font-size:10px;">Online Gym</small></a><img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4AV9KC+BUVTIQ+4RUO+5Z6WY" alt="">', prob: 1.0, tags: ['diet', 'yoga', 'health'] },

                // === ダンス ===
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+AO0LYQ+4QI2+5ZEMQ" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">💃 継続率98%のオンラインダンスレッスン【スポとも】<br><small style="color:#888; font-size:10px;">Dance Lesson</small></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4AV9KC+AO0LYQ+4QI2+5ZEMQ" alt="">', prob: 1.0, tags: ['dance'] },

                // === ゴルフ ===
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+AJUKQA+3BTW+5YJRM" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">⛳️ 初心者専用ゴルフスクール【サンクチュアリ】<br><small style="color:#888; font-size:10px;">Golf School</small></a><img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4AV9KC+AJUKQA+3BTW+5YJRM" alt="">', prob: 1.0, tags: ['golf'] },
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AV9KC+AG9Z3M+CW6+BF23HE" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">⛳️ RIZAP GOLF<br><small style="color:#888; font-size:10px;">Pro Golf Lesson</small></a><img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=4AV9KC+AG9Z3M+CW6+BF23HE" alt="">', prob: 1.0, tags: ['golf'] },
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AVACA+958QB6+4ABU+BX3J6" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">⛳️ ゴルフ用品通販【VictoriaGolf】<br><small style="color:#888; font-size:10px;">Golf Gear Shop</small></a><img border="0" width="1" height="1" src="https://www11.a8.net/0.gif?a8mat=4AVACA+958QB6+4ABU+BX3J6" alt="">', prob: 1.0, tags: ['golf'] },
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AVACA+A8JC8I+5316+5YRHE" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">📏 ゴルフ用距離計測器 Voicecaddie<br><small style="color:#888; font-size:10px;">Golf Distance Meter</small></a><img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4AVACA+A8JC8I+5316+5YRHE" alt="">', prob: 1.0, tags: ['golf'] },

                // === スポーツ全般・アウトドア ===
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AVACA+9KQ01E+3OSK+5YJRM" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">🏃 【最短翌日配送】スポーツデポ公式ストア<br><small style="color:#888; font-size:10px;">Sports Depot Online</small></a><img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=4AVACA+9KQ01E+3OSK+5YJRM" alt="">', prob: 1.0, tags: ['sport', 'baseball', 'soccer', 'golf', 'dance'] },
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AVACA+9MIAUQ+4ABU+NW4IA" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">🏂 マリン＆スノースポーツ用品【Victoria】<br><small style="color:#888; font-size:10px;">Surf & Snow Gear</small></a><img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4AVACA+9MIAUQ+4ABU+NW4IA" alt="">', prob: 1.0, tags: ['sport', 'outdoor'] },
                { html: '<a href="https://px.a8.net/svt/ejp?a8mat=4AVACA+AABN1U+5MZI+5YJRM" rel="nofollow" target="_blank" style="color:#007AFF; text-decoration:none; font-weight:500;">🏄 自由なスタイルを【ムラサキスポーツ】<br><small style="color:#888; font-size:10px;">Action Sports Gear</small></a><img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4AVACA+AABN1U+5MZI+5YJRM" alt="">', prob: 1.0, tags: ['sport', 'outdoor', 'skate'] },

                // === 開発支援 (全ページ共通で出すが、確率は低めでもOK) ===
                { text: '☕️ 開発を支援する (Buy Me a Coffee)', sub: 'Support the developer', url: 'https://buymeacoffee.com/kunifami20w', prob: 1.0, tags: [] } // tags空配列は全ページ対象
            ]
        },
        
        // --- アメリカ向け (US) ---
        us: {
            message: "Take your first step toward a new level today.",
            suggestions: [
                { text: '☕️ Love this tool? Buy me a coffee!', prob: 1.0, tags: [] }
            ],
            resources: [
                { text: '☕️ Support the Developer', sub: 'Support the developer', url: 'https://buymeacoffee.com/kunifami20w', prob: 1.0, tags: [] }
            ]
        },
        
        // --- その他 (X) ---
        x: {
            message: "Start your journey to mastery right here.",
            suggestions: [
                { text: '☕️ Keep this project alive!', prob: 1.0, tags: [] }
            ],
            resources: [
                { text: '☕️ Support the Developer', sub: 'Support the developer', url: 'https://buymeacoffee.com/kunifami20w', prob: 1.0, tags: [] }
            ]
        }
    };

    const currentData = adData[region];

    /**
     * ■ フィルタリングロジック
     * 1. 確率 (prob) で足切り
     * 2. タグ (tags) で優先順位付け
     * - ページ指定タグと一致するものがあれば、それを優先
     * - 一致するものがない、または数が少ない場合は、全般タグ(空配列)も混ぜる
     */
    const filterAndSortItems = (items, pageTags) => {
        // 1. 確率判定で候補に残す
        let candidates = items.filter(item => {
            const probability = (item.prob !== undefined ? item.prob : 1.0);
            return Math.random() < probability;
        });

        // 全滅防止
        if (candidates.length === 0) candidates = items;

        // 2. タグによるスコアリング
        // マッチするタグが多いほど高スコア。タグなし(全般)は低スコアだが表示はされる。
        const scoredCandidates = candidates.map(item => {
            let score = 0;
            if (item.tags && item.tags.length > 0) {
                // アイテムのタグが、ページのタグに含まれていれば加点
                const matchCount = item.tags.filter(t => pageTags.includes(t)).length;
                if (matchCount > 0) {
                    score = 10 + matchCount; // マッチしたら優先度高
                } else {
                    score = 0; // マッチしない特定ジャンルは表示しない（厳密に分ける場合）
                    // ※ もし「ゴルフページでもダンス広告を出していい」ならここを調整
                }
            } else {
                // タグ指定なし（全般アイテム）は、マッチしたアイテムよりは下だが、除外はしない
                score = 1; 
            }
            return { item, score };
        });

        // スコア0（全く関係ないジャンル）を除外
        // 例: ゴルフページで tags:['dance'] のアイテムは score 0 になる
        const filtered = scoredCandidates.filter(x => x.score > 0);

        // スコアが高い順にソートしつつ、同スコア内ではランダムに
        filtered.sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            return 0.5 - Math.random();
        });

        return filtered.map(x => x.item);
    };


    // 1. ポジティブメッセージ
    const msgArea = document.getElementById('positiveMessage');
    if (msgArea) msgArea.innerHTML = currentData.message;

    // 2. バナー（1件）
    const suggestionArea = document.getElementById('randomSuggestion');
    if (suggestionArea && currentData.suggestions.length > 0) {
        // 文字列のみのデータがあればオブジェクト化
        const items = currentData.suggestions.map(item => {
            if (typeof item === 'string') return { text: item, prob: 1.0, tags: [] };
            return item;
        });

        const filteredItems = filterAndSortItems(items, pageTags);
        
        if (filteredItems.length > 0) {
            // ソート済みなので先頭が最も関連度が高い。ただしバナーは1つなので、
            // 上位3つくらいからランダムにするなど工夫しても良いが、ここでは最上位を表示
            suggestionArea.innerHTML = filteredItems[0].text;
        }
    }

    // 3. リソースリスト
    const resourceList = document.getElementById('resourceList');
    if (resourceList && currentData.resources.length > 0) {
        
        const filteredItems = filterAndSortItems(currentData.resources, pageTags);

        // 最初の5件
        const top5 = filteredItems.slice(0, 5);
        // 次の5件
        const next5 = filteredItems.slice(5, 10);

        let html = '<p style="font-size: 10px; color: #999; margin-bottom: 8px; text-transform: uppercase;">Recommended</p>';
        
        const createItem = (item) => {
            if (item.html) {
                return `<li style="margin-bottom: 12px;">${item.html}</li>`;
            } else {
                return `<li style="margin-bottom: 12px;">
                    <a href="${item.url}" target="_blank" style="color: #007AFF; text-decoration: none; font-weight: 500;">
                        ${item.text}<br><small style="color: #888; font-size: 10px; font-weight: normal;">${item.sub}</small>
                    </a>
                </li>`;
            }
        };

        top5.forEach(item => {
            html += createItem(item);
        });

        if (next5.length > 0) {
            html += `
            <details style="margin-top: 10px;">
                <summary style="font-size: 12px; color: #007AFF; cursor: pointer; font-weight: bold; outline: none; padding: 5px 0;">
                    ▼ もっと見る / View More
                </summary>
                <div style="margin-top: 10px; padding-left: 5px; border-left: 2px solid #eee;">
            `;
            next5.forEach(item => {
                html += createItem(item);
            });
            html += `</div></details>`;
        }

        resourceList.innerHTML = html;
    }
})();
