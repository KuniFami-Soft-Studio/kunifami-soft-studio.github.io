/**
 * ad-manager.js v3.9 - Secure Edition
 * 【Security Update】
 * XSS脆弱性対策のため、innerHTMLの使用を廃止し、DOM操作による安全な描画に変更しました。
 */
(function() {
    // ============================================================
    // ⚙️ 設定
    // ============================================================
    const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTc5Lkgk71EaZfis4_tY-f1jVr5YdlyWqCIvbBAEmhIpejzx0IGiDCV8QU9n72jVe7lHmM4irhgrPrZ/pub?gid=0&single=true&output=csv";
    
    const CONFIG = {
        ENABLED: true,
        DEBUG: true,             // ★本番・審査用は false
        MOBILE_BREAKPOINT: 768,
        DEFAULT_COUNT_PC: 5,
        DEFAULT_COUNT_MOBILE: 3
    };
    
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    const userLang = (navigator.language || navigator.userLanguage).toLowerCase();
    
    // ============================================================
    // 🌍 リージョン判定ロジック
    // ============================================================
    const urlParams = new URLSearchParams(window.location.search);
    let region = urlParams.get('reg'); 

    if (!region) {
        region = 'us'; // デフォルト

        if (userLang.includes('ja') || userTimeZone.includes('tokyo')) {
            region = 'jp';
        } 
        // --- アラビア語圏 ---
        else if (userLang.includes('ar') || userTimeZone.includes('cairo') || userTimeZone.includes('riyadh') || userTimeZone.includes('dubai')) {
            region = 'ar';
        }
        // --- ポルトガル語圏 ---
        else if (userLang.includes('pt') || userTimeZone.includes('sao_paulo') || userTimeZone.includes('lisbon')) {
            region = 'br'; 
        } 
        // --- スペイン語圏 ---
        else if (userLang.includes('es') || userTimeZone.includes('madrid') || userTimeZone.includes('mexico')) {
            region = 'es';
        } 
        // --- 英語圏 ---
        else if (userLang.includes('en-gb') || userTimeZone.includes('london')) {
            region = 'gb';
        } else if (userLang.includes('en-ca') || userTimeZone.includes('toronto')) {
            region = 'ca';
        } else if (userLang.includes('en-au') || userTimeZone.includes('sydney')) {
            region = 'au';
        } else if (userLang.includes('hi') || userLang.includes('in') || userTimeZone.includes('calcutta')) {
            region = 'in';
        } 
        // --- ヨーロッパ主要国 ---
        else if (userLang.includes('de') || userTimeZone.includes('berlin')) {
            region = 'de';
        } else if (userLang.includes('fr') || userTimeZone.includes('paris')) {
            region = 'fr';
        }
    }
    
    // ============================================================
    // 🚀 初期化・データ取得
    // ============================================================
    async function init() {
        if (!CONFIG.ENABLED) return;
        try {
            const res = await fetch(SPREADSHEET_CSV_URL);
            const text = await res.text();
            const data = parseCSV(text);
            render(data);
        } catch (e) {
            console.error("AdManager Init Failed:", e);
        }
    }
    
    function parseCSV(csv) {
        const rows = csv.split(/\r?\n/).map(row => row.split(',').map(v => v.replace(/^"|"$/g, '').trim()));
        const res = { message: "", suggestions: [], resources: [] };
        const enGroup = ['us', 'gb', 'ca', 'au'];
    
        for (let i = 1; i < rows.length; i++) {
            // 列定義: region, type, tags, (unused), (unused), text, sub, url, prob, status
            const [reg, type, tags, , , txt, sub, url, prob, status] = rows[i];
    
            if (status !== 'Active') continue;
            if (Math.random() > parseFloat(prob || 1.0)) continue;
    
            const isLocalMatch = (reg === region);
            const isEnCommon = (reg === 'en' && enGroup.includes(region));

            if (!isLocalMatch && !isEnCommon) continue;
    
            const item = { text: txt, sub: sub, url: url, tags: tags ? tags.split('/') : [] };
    
            if (type === 'message' && reg === region) res.message = txt;
            if (type === 'suggestion') res.suggestions.push(item);
            if (type === 'resource') res.resources.push(item);
        }
        return res;
    }
    
    function filterItems(items, targetTags) {
        return items.map(item => {
            let score = 1;
            if (item.tags.length > 0 && targetTags.length > 0) {
                const match = item.tags.filter(t => targetTags.includes(t)).length;
                if (match > 0) score = 10 + match;
            }
            return { item, score };
        }).sort((a, b) => b.score - a.score || 0.5 - Math.random()).map(x => x.item);
    }

    // ============================================================
    // 🛠️ DOM生成ヘルパー（安全対策の中核）
    // ============================================================
    function createDebugLabel(name, tag) {
        if (!CONFIG.DEBUG) return null;
        const div = document.createElement('div');
        div.style.cssText = "position:absolute; top:-18px; left:0; background:#ff4d4d; color:white; font-size:10px; padding:1px 4px; z-index:100; font-family:sans-serif;";
        div.textContent = `DEBUG: ${name} [${tag}]`;
        return div;
    }

    function applyDebugStyle(el) {
        if (CONFIG.DEBUG) {
            el.style.border = "2px dashed #ff4d4d";
            el.style.position = "relative";
            el.style.minHeight = "40px";
            el.style.background = "#fff5f5";
            el.style.margin = "5px 0";
        }
    }

    // ============================================================
    // 🎨 描画処理 (DOM操作版)
    // ============================================================
    function render(data) {
        const isRTL = (region === 'ar');
        
        // 共通のスタイル適用関数
        const applyRTL = (el) => {
            if (isRTL) {
                el.setAttribute('dir', 'rtl');
                el.style.textAlign = 'right';
            } else {
                el.setAttribute('dir', 'ltr');
                el.style.textAlign = 'left';
            }
        };

        // 1. ポジティブメッセージ
        document.querySelectorAll('.positiveMessage').forEach(el => {
            // クリア
            el.textContent = '';
            
            applyDebugStyle(el);
            applyRTL(el);

            const debugLabel = createDebugLabel("Message", region);
            if (debugLabel) el.appendChild(debugLabel);

            // メッセージテキストの追加（安全なテキストとして追加）
            const msgText = data.message || (CONFIG.DEBUG ? "No Message Data" : "");
            el.appendChild(document.createTextNode(msgText));
        });
    
        // 2. バナー
        document.querySelectorAll('.randomSuggestion').forEach(el => {
            el.textContent = ''; // クリア
            
            applyDebugStyle(el);
            applyRTL(el);

            const tagsAttr = (el.getAttribute('data-tags') || '');
            const tags = tagsAttr.split(',').map(t => t.trim());
            const filtered = filterItems(data.suggestions, tags);
            
            const debugLabel = createDebugLabel("Banner", tagsAttr);
            if (debugLabel) el.appendChild(debugLabel);
    
            if (filtered[0]) {
                const a = document.createElement('a');
                a.href = filtered[0].url;
                a.target = "_blank";
                a.style.cssText = "color:inherit; text-decoration:none; display:block;";
                a.textContent = filtered[0].text;
                el.appendChild(a);
            } else if (CONFIG.DEBUG) {
                el.appendChild(document.createTextNode("表示対象のデータがありません"));
            }
        });
    
        // 3. リソースリスト
        document.querySelectorAll('.resourceList').forEach(el => {
            el.textContent = ''; // クリア
            
            applyDebugStyle(el);
            applyRTL(el);
            
            const tagsAttr = (el.getAttribute('data-tags') || '');
            const tags = tagsAttr.split(',').map(t => t.trim());
            const count = parseInt(el.getAttribute(isMobile ? 'data-mobile-count' : 'data-pc-count') || (isMobile ? CONFIG.DEFAULT_COUNT_MOBILE : CONFIG.DEFAULT_COUNT_PC), 10);
            const filtered = filterItems(data.resources, tags).slice(0, count);
    
            const debugLabel = createDebugLabel("List", tagsAttr);
            if (debugLabel) el.appendChild(debugLabel);

            // Sponsored ラベル
            const sponsoredLabel = document.createElement('p');
            sponsoredLabel.style.cssText = "font-size:10px; color:#999; margin-bottom:8px; text-transform:uppercase;";
            sponsoredLabel.textContent = "Sponsored";
            el.appendChild(sponsoredLabel);
            
            if (filtered.length > 0) {
                filtered.forEach(item => {
                    const li = document.createElement('li');
                    li.style.cssText = "margin-bottom:12px; list-style:none;";

                    const a = document.createElement('a');
                    a.href = item.url;
                    a.target = "_blank";
                    a.style.cssText = "color:#007AFF; text-decoration:none; font-weight:500;";

                    // メインテキスト
                    a.appendChild(document.createTextNode(item.text));
                    a.appendChild(document.createElement('br'));

                    // サブテキスト
                    const small = document.createElement('small');
                    small.style.cssText = "color:#888; font-size:10px;";
                    small.textContent = item.sub;
                    
                    a.appendChild(small);
                    li.appendChild(a);
                    el.appendChild(li);
                });
            } else if (CONFIG.DEBUG) {
                const li = document.createElement('li');
                li.textContent = "表示対象のデータがありません";
                el.appendChild(li);
            }
        });
    }
    
})();/**
    init();
 * ad-manager.js v3.8 - Global Region & RTL Support
 * 【Update Detail】
 * 1. アラビア語 (ar) のリージョン判定を追加
 * 2. RTL (Right-to-Left) 表示の動的サポートを追加
 * 3. 未知の国はデフォルトで 'us' として扱い英語広告で収益化
 * 4. 審査用設定完備 (Sponsored表記)
 */
(function() {
    // ============================================================
    // ⚙️ 設定（SPREADSHEET_CSV_URL を自分のものに書き換えてください）
    // ============================================================
    const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTc5Lkgk71EaZfis4_tY-f1jVr5YdlyWqCIvbBAEmhIpejzx0IGiDCV8QU9n72jVe7lHmM4irhgrPrZ/pub?gid=0&single=true&output=csv";
    
    const CONFIG = {
        ENABLED: true,
        DEBUG: true,             // ★本番・審査用は false
        MOBILE_BREAKPOINT: 768,
        DEFAULT_COUNT_PC: 5,
        DEFAULT_COUNT_MOBILE: 3
    };
    
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    const userLang = (navigator.language || navigator.userLanguage).toLowerCase();
    
    // ============================================================
    // 🌍 リージョン判定ロジック
    // ============================================================
    const urlParams = new URLSearchParams(window.location.search);
    let region = urlParams.get('reg'); 

    if (!region) {
        region = 'us'; // デフォルト

        if (userLang.includes('ja') || userTimeZone.includes('tokyo')) {
            region = 'jp';
        } 
        // --- アラビア語圏 ---
        else if (userLang.includes('ar') || userTimeZone.includes('cairo') || userTimeZone.includes('riyadh') || userTimeZone.includes('dubai')) {
            region = 'ar';
        }
        // --- ポルトガル語圏 ---
        else if (userLang.includes('pt') || userTimeZone.includes('sao_paulo') || userTimeZone.includes('lisbon')) {
            region = 'br'; 
        } 
        // --- スペイン語圏 ---
        else if (userLang.includes('es') || userTimeZone.includes('madrid') || userTimeZone.includes('mexico')) {
            region = 'es';
        } 
        // --- 英語圏 ---
        else if (userLang.includes('en-gb') || userTimeZone.includes('london')) {
            region = 'gb';
        } else if (userLang.includes('en-ca') || userTimeZone.includes('toronto')) {
            region = 'ca';
        } else if (userLang.includes('en-au') || userTimeZone.includes('sydney')) {
            region = 'au';
        } else if (userLang.includes('hi') || userLang.includes('in') || userTimeZone.includes('calcutta')) {
            region = 'in';
        } 
        // --- ヨーロッパ主要国 ---
        else if (userLang.includes('de') || userTimeZone.includes('berlin')) {
            region = 'de';
        } else if (userLang.includes('fr') || userTimeZone.includes('paris')) {
            region = 'fr';
        }
    }
    
    // ============================================================
    // 🚀 初期化・データ取得
    // ============================================================
    async function init() {
        if (!CONFIG.ENABLED) return;
        try {
            const res = await fetch(SPREADSHEET_CSV_URL);
            const text = await res.text();
            const data = parseCSV(text);
            render(data);
        } catch (e) {
            console.error("AdManager Init Failed:", e);
        }
    }
    
    function parseCSV(csv) {
        const rows = csv.split(/\r?\n/).map(row => row.split(',').map(v => v.replace(/^"|"$/g, '').trim()));
        const res = { message: "", suggestions: [], resources: [] };
        const enGroup = ['us', 'gb', 'ca', 'au'];
    
        for (let i = 1; i < rows.length; i++) {
            const [reg, type, tags, , , txt, sub, url, prob, status] = rows[i];
    
            if (status !== 'Active') continue;
            if (Math.random() > parseFloat(prob || 1.0)) continue;
    
            const isLocalMatch = (reg === region);
            const isEnCommon = (reg === 'en' && enGroup.includes(region));

            if (!isLocalMatch && !isEnCommon) continue;
    
            const item = { text: txt, sub: sub, url: url, tags: tags ? tags.split('/') : [] };
    
            if (type === 'message' && reg === region) res.message = txt;
            if (type === 'suggestion') res.suggestions.push(item);
            if (type === 'resource') res.resources.push(item);
        }
        return res;
    }
    
    function filterItems(items, targetTags) {
        return items.map(item => {
            let score = 1;
            if (item.tags.length > 0 && targetTags.length > 0) {
                const match = item.tags.filter(t => targetTags.includes(t)).length;
                if (match > 0) score = 10 + match;
            }
            return { item, score };
        }).sort((a, b) => b.score - a.score || 0.5 - Math.random()).map(x => x.item);
    }
    
    // ============================================================
    // 🎨 描画処理 (RTL サポート版)
    // ============================================================
    function render(data) {
        const isRTL = (region === 'ar');
        const debugStyle = "border: 2px dashed #ff4d4d; position: relative; min-height: 40px; background: #fff5f5; margin: 5px 0;";
        const debugLabel = (name, tag) => CONFIG.DEBUG ? `<div style="position:absolute; top:-18px; left:0; background:#ff4d4d; color:white; font-size:10px; padding:1px 4px; z-index:100; font-family:sans-serif;">DEBUG: ${name} [${tag}]</div>` : "";
    
        // 共通のスタイル適用関数
        const applyRTL = (el) => {
            if (isRTL) {
                el.setAttribute('dir', 'rtl');
                el.style.textAlign = 'right';
            } else {
                el.setAttribute('dir', 'ltr');
                el.style.textAlign = 'left';
            }
        };

        // 1. ポジティブメッセージ
        document.querySelectorAll('.positiveMessage').forEach(el => {
            if (CONFIG.DEBUG) el.style.cssText += debugStyle;
            applyRTL(el);
            el.innerHTML = debugLabel("Message", region) + (data.message || (CONFIG.DEBUG ? "No Message Data" : ""));
        });
    
        // 2. バナー
        document.querySelectorAll('.randomSuggestion').forEach(el => {
            if (CONFIG.DEBUG) el.style.cssText += debugStyle;
            applyRTL(el);
            const tags = (el.getAttribute('data-tags') || '').split(',').map(t => t.trim());
            const filtered = filterItems(data.suggestions, tags);
    
            if (filtered[0]) {
                el.innerHTML = debugLabel("Banner", tags) + `<a href="${filtered[0].url}" target="_blank" style="color:inherit;text-decoration:none;display:block;">${filtered[0].text}</a>`;
            } else if (CONFIG.DEBUG) {
                el.innerHTML = debugLabel("Banner", tags) + "表示対象のデータがありません";
            }
        });
    
        // 3. リソースリスト
        document.querySelectorAll('.resourceList').forEach(el => {
            if (CONFIG.DEBUG) el.style.cssText += debugStyle;
            applyRTL(el);
            const tags = (el.getAttribute('data-tags') || '').split(',').map(t => t.trim());
            const count = parseInt(el.getAttribute(isMobile ? 'data-mobile-count' : 'data-pc-count') || (isMobile ? CONFIG.DEFAULT_COUNT_MOBILE : CONFIG.DEFAULT_COUNT_PC), 10);
            const filtered = filterItems(data.resources, tags).slice(0, count);
    
            let html = debugLabel("List", tags) + `<p style="font-size:10px;color:#999;margin-bottom:8px;text-transform:uppercase;">Sponsored</p>`;
            
            if (filtered.length > 0) {
                filtered.forEach(item => {
                    html += `<li style="margin-bottom:12px; list-style:none;">
                        <a href="${item.url}" target="_blank" style="color:#007AFF;text-decoration:none;font-weight:500;">
                            ${item.text}<br><small style="color:#888;font-size:10px;">${item.sub}</small>
                        </a>
                    </li>`;
                });
            } else if (CONFIG.DEBUG) {
                html += "<li>表示対象のデータがありません</li>";
            }
            el.innerHTML = html;
        });
    }
    
    init();
})();
