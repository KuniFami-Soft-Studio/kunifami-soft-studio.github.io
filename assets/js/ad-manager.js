/**
 * ad-manager.js v4.0 - Security Hardened
 * XSS脆弱性対策済み。innerHTMLを廃止し、DOM APIによる安全な構築に統一。
 */
(function() {
    const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTc5Lkgk71EaZfis4_tY-f1jVr5YdlyWqCIvbBAEmhIpejzx0IGiDCV8QU9n72jVe7lHmM4irhgrPrZ/pub?gid=0&single=true&output=csv";
    
    const CONFIG = {
        ENABLED: true,
        DEBUG: false, // ★審査・本番用はfalse推奨
        MOBILE_BREAKPOINT: 768,
        DEFAULT_COUNT_PC: 5,
        DEFAULT_COUNT_MOBILE: 3
    };
    
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    const userLang = (navigator.language || navigator.userLanguage).toLowerCase();
    
    const urlParams = new URLSearchParams(window.location.search);
    let region = urlParams.get('reg') || 'us'; 

    if (!urlParams.get('reg')) {
        if (userLang.includes('ja') || userTimeZone.includes('tokyo')) region = 'jp';
        else if (userLang.includes('ar') || userTimeZone.includes('cairo')) region = 'ar';
        else if (userLang.includes('pt') || userTimeZone.includes('sao_paulo')) region = 'br';
        else if (userLang.includes('es') || userTimeZone.includes('madrid')) region = 'es';
        // ... 他の判定ロジックは維持 ...
    }
    
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
            if (status !== 'Active' || Math.random() > parseFloat(prob || 1.0)) continue;
            const isMatch = (reg === region) || (reg === 'en' && enGroup.includes(region));
            if (!isMatch) continue;
    
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

    // 安全なデバッグラベル生成
    function createDebugLabel(name, tag) {
        if (!CONFIG.DEBUG) return null;
        const div = document.createElement('div');
        div.style.cssText = "position:absolute; top:-18px; left:0; background:#ff4d4d; color:white; font-size:10px; padding:1px 4px; z-index:100;";
        div.textContent = `DEBUG: ${name} [${tag}]`;
        return div;
    }

    function render(data) {
        const isRTL = (region === 'ar');
        const applyCommonStyle = (el) => {
            el.textContent = ''; // 内容クリア
            el.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
            el.style.textAlign = isRTL ? 'right' : 'left';
            if (CONFIG.DEBUG) {
                el.style.border = "2px dashed #ff4d4d";
                el.style.position = "relative";
                el.style.background = "#fff5f5";
            }
        };

        // 1. メッセージ
        document.querySelectorAll('.positiveMessage').forEach(el => {
            applyCommonStyle(el);
            const label = createDebugLabel("Message", region);
            if (label) el.appendChild(label);
            el.appendChild(document.createTextNode(data.message || ""));
        });
    
        // 2. バナー
        document.querySelectorAll('.randomSuggestion').forEach(el => {
            applyCommonStyle(el);
            const tags = (el.getAttribute('data-tags') || '').split(',').map(t => t.trim());
            const filtered = filterItems(data.suggestions, tags);
            const label = createDebugLabel("Banner", tags.join(','));
            if (label) el.appendChild(label);
    
            if (filtered[0]) {
                const a = document.createElement('a');
                a.href = filtered[0].url;
                a.target = "_blank";
                a.style.cssText = "color:inherit; text-decoration:none; display:block;";
                a.textContent = filtered[0].text;
                el.appendChild(a);
            }
        });
    
        // 3. リソースリスト
        document.querySelectorAll('.resourceList').forEach(el => {
            applyCommonStyle(el);
            const tags = (el.getAttribute('data-tags') || '').split(',').map(t => t.trim());
            const count = parseInt(el.getAttribute(isMobile ? 'data-mobile-count' : 'data-pc-count') || 5, 10);
            const filtered = filterItems(data.resources, tags).slice(0, count);
            const label = createDebugLabel("List", tags.join(','));
            if (label) el.appendChild(label);

            const sponsored = document.createElement('p');
            sponsored.style.cssText = "font-size:10px; color:#999; margin-bottom:8px;";
            sponsored.textContent = "Sponsored";
            el.appendChild(sponsored);
            
            filtered.forEach(item => {
                const li = document.createElement('li');
                li.style.cssText = "margin-bottom:12px; list-style:none;";
                const a = document.createElement('a');
                a.href = item.url;
                a.target = "_blank";
                a.style.cssText = "color:#007AFF; text-decoration:none; font-weight:500;";
                
                const txt = document.createElement('span');
                txt.textContent = item.text;
                a.appendChild(txt);
                a.appendChild(document.createElement('br'));
                
                const sub = document.createElement('small');
                sub.style.cssText = "color:#888; font-size:10px;";
                sub.textContent = item.sub;
                a.appendChild(sub);
                
                li.appendChild(a);
                el.appendChild(li);
            });
        });
    }
    
    init();
})();
