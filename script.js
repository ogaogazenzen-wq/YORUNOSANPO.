document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       0. 共通設定
       ========================================= */
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-_"; 
    const enterPage = document.getElementById('enter-page');
    const grid = document.getElementById('noise-grid');
    const mainContent = document.getElementById('main-content');
    
    const walkCanvas = document.getElementById('walkCanvas');
    const homeWalkCanvas = document.getElementById('homeWalkCanvas');
    const uiBottomWrapper = document.querySelector('.ui-bottom-wrapper'); 
    
    // ナビゲーション
    const navRight = document.getElementById('nav-right');
    const navLeft = document.getElementById('nav-left');

    const groups = [
        document.getElementById('group-title'),             // 0
        document.getElementById('group-prologue'),          // 1
        document.getElementById('group-about'),             // 2
        document.getElementById('group-sorrow'),            // 3
        document.getElementById('group-gallery'),           // 4
        document.getElementById('group-kikyou'),            // 5
        document.getElementById('group-gallery-kikyou'),    // 6
        document.getElementById('group-ritsuzen'),          // 7
        document.getElementById('group-gallery-ritsuzen'),  // 8
        document.getElementById('group-warmth'),            // 9
        document.getElementById('group-gallery-warmth'),    // 10
        document.getElementById('group-sunrise'),           // 11
        document.getElementById('group-home')               // 12
    ];
    
    const pageData = [
        ["00", "TITLE"], ["01", "PROLOGUE"], ["02", "ABOUT"],
        ["03", "SORROW"], ["03", "SORROW"],
        ["04", "EXHILARATION"], ["04", "EXHILARATION"],
        ["05", "SHIVERS"], ["05", "SHIVERS"],
        ["06", "WARMTH"], ["06", "WARMTH"],
        ["07", "SUNRISE"], ["00", "HOME"]
    ];

    const rootIds = [
        '', 'prologue-text-root', 'about-text-root', 'sorrow-text-root', '',
        'kikyou-text-root', '', 'ritsuzen-text-root', '',
        'warmth-text-root', '', 'sunrise-text-root', ''
    ];

    let currentPage = 0;
    const totalPages = groups.length;
    let textTimer; 
    let gridAnimationId;

    /* 1. ENTERアニメーション */
    function initGrid() {
        if(!grid) return;
        grid.innerHTML = '';
        if(gridAnimationId) cancelAnimationFrame(gridAnimationId);
        const isMobile = window.innerWidth < 768;
        const cellSize = isMobile ? 14 : 20; 
        const marginX = isMobile ? 30 : 60;
        const marginY = isMobile ? 80 : 60;
        let cols = Math.floor((window.innerWidth - marginX) / cellSize);
        let rows = Math.floor((window.innerHeight - marginY) / cellSize);
        if (cols % 2 === 0) cols--;
        if (rows % 2 === 0) rows--;
        grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
        const items = [];
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < cols * rows; i++) {
            const div = document.createElement('div');
            div.classList.add('grid-item'); div.textContent = "_";
            fragment.appendChild(div);
            items.push({ el: div, locked: false, target: "_", isEnter: false, isActiveNoise: false });
        }
        grid.appendChild(fragment);
        const midRow = Math.floor(rows / 2);
        const midCol = Math.floor(cols / 2);
        const enterChars = ["{", "E", "N", "T", "E", "R", "}"];
        if(midRow >= 0 && midCol >= 3) {
            const startIdx = (midRow * cols) + (midCol - 3); 
            enterChars.forEach((char, i) => {
                if (items[startIdx + i]) {
                    items[startIdx + i].target = char; items[startIdx + i].isEnter = true;
                }
            });
        }
        startGridAnimation(items);
    }

    function startGridAnimation(items) {
        let frame = 0;
        const chaosFrames = 90; const resolveFrames = 180;
        function animate() {
            if (frame < chaosFrames) {
                const chaosProgress = frame / chaosFrames;
                items.forEach(item => {
                    if (!item.isActiveNoise && Math.random() < chaosProgress * 0.2) item.isActiveNoise = true;
                    if (item.isActiveNoise && frame % 8 === 0) item.el.textContent = chars[Math.floor(Math.random() * chars.length)];
                });
            } else {
                const resolveProgress = (frame - chaosFrames) / resolveFrames;
                const threshold = Math.pow(resolveProgress, 3);
                items.forEach(item => {
                    if (item.locked) return;
                    if (Math.random() < threshold) {
                        item.locked = true; item.el.textContent = item.target;
                        if (item.isEnter) item.el.classList.add('is-enter');
                    } else if (frame % 8 === 0) {
                        item.el.textContent = chars[Math.floor(Math.random() * chars.length)];
                    }
                });
            }
            frame++; gridAnimationId = requestAnimationFrame(animate);
        }
        gridAnimationId = requestAnimationFrame(animate);
    }
    initGrid();

    if(enterPage) {
        enterPage.addEventListener('click', () => {
            enterPage.style.opacity = '0';
            setTimeout(() => {
                enterPage.style.display = 'none';
                if(mainContent) mainContent.style.opacity = '1';
                if(uiBottomWrapper) uiBottomWrapper.classList.add('is-active');
            }, 500);
        });
    }

    /* 2. ピクトグラム */
    if(walkCanvas) {
        const wCtx = walkCanvas.getContext('2d');
        let walkTime = 0;
        function drawWalker() {
            wCtx.clearRect(0, 0, walkCanvas.width, walkCanvas.height);
            const cx = 100, cy = 100; walkTime += 0.1;
            const bounce = Math.sin(walkTime * 2) * 1.2;
            wCtx.strokeStyle = '#fff'; wCtx.lineWidth = 4; wCtx.lineCap = 'round';
            wCtx.beginPath(); wCtx.arc(cx + 3, cy - 30 + bounce, 7, 0, Math.PI * 2);
            wCtx.moveTo(cx + 3, cy - 23 + bounce); wCtx.lineTo(cx, cy + 6 + bounce);
            const aR = Math.sin(walkTime) * 0.6, aL = Math.sin(walkTime + Math.PI) * 0.6;
            const drawLimb = (startX, startY, angle, len) => {
                wCtx.moveTo(startX, startY);
                wCtx.lineTo(startX + Math.sin(angle) * len, startY + Math.cos(angle) * len);
            };
            drawLimb(cx, cy + 6 + bounce, aR, 30); drawLimb(cx, cy + 6 + bounce, aL, 30);
            drawLimb(cx + 3, cy - 17 + bounce, aL, 25); drawLimb(cx + 3, cy - 17 + bounce, aR, 25);
            wCtx.stroke(); requestAnimationFrame(drawWalker);
        }
        drawWalker();
    }

    if(homeWalkCanvas) {
        const hCtx = homeWalkCanvas.getContext('2d');
        let homeWalkTime = 0;
        function drawHomeWalker() {
            hCtx.clearRect(0, 0, homeWalkCanvas.width, homeWalkCanvas.height);
            const cx = 100, cy = 100; 
            homeWalkTime += 0.1;
            const bounce = Math.sin(homeWalkTime * 2) * 1.2;
            hCtx.strokeStyle = '#000000'; 
            hCtx.lineWidth = 4; hCtx.lineCap = 'round';
            hCtx.beginPath(); hCtx.arc(cx + 3, cy - 30 + bounce, 7, 0, Math.PI * 2);
            hCtx.moveTo(cx + 3, cy - 23 + bounce); hCtx.lineTo(cx, cy + 6 + bounce);
            const aR = Math.sin(homeWalkTime) * 0.6, aL = Math.sin(homeWalkTime + Math.PI) * 0.6;
            const drawLimb = (startX, startY, angle, len) => {
                hCtx.moveTo(startX, startY);
                hCtx.lineTo(startX + Math.sin(angle) * len, startY + Math.cos(angle) * len);
            };
            drawLimb(cx, cy + 6 + bounce, aR, 30); drawLimb(cx, cy + 6 + bounce, aL, 30);
            drawLimb(cx + 3, cy - 17 + bounce, aL, 25); drawLimb(cx + 3, cy - 17 + bounce, aR, 25);
            hCtx.stroke();
            requestAnimationFrame(drawHomeWalker);
        }
        drawHomeWalker();
    }

    /* 3. ページ遷移 */
    window.updateHeader = function(num, txt) {
        const nEl = document.getElementById('ui-number'), lEl = document.getElementById('ui-label');
        if(!nEl || !lEl) return;
        let s = 0; const t = setInterval(() => {
            if (s++ < 20) {
                nEl.textContent = chars[Math.floor(Math.random()*chars.length)] + chars[Math.floor(Math.random()*chars.length)];
                lEl.textContent = Array(txt.length).fill().map(()=>chars[Math.floor(Math.random()*chars.length)]).join('');
            } else { clearInterval(t); nEl.textContent = num; lEl.textContent = txt; }
        }, 30);
    };

    function changePage(next) {
        if (next < 0 || next >= totalPages || next === currentPage) return;
        if (textTimer) { clearInterval(textTimer); textTimer = null; }
        if ([1, 2, 11].includes(next)) {
        document.body.classList.add('is-photo-page');
    } else {
        document.body.classList.remove('is-photo-page');
    }

        const isWhite = (next === 11 || next === 12); 
        if (isWhite) {
            document.body.classList.add('is-white-mode');
            if(mainContent) mainContent.style.backgroundColor = '#ffffff'; 
        } else {
            document.body.classList.remove('is-white-mode');
            if(mainContent) mainContent.style.backgroundColor = '#000000';
        }

        if(groups[currentPage]) groups[currentPage].style.opacity = '0';

        setTimeout(() => {
            if(groups[currentPage]) {
                groups[currentPage].style.display = 'none'; 
                groups[currentPage].classList.remove('is-active');
            }
            
            if(groups[next]) {
                // HOMEならblock、他はflex。ナビの表示切替もここ
                if (next === 12) {
                    groups[next].style.display = 'block'; 
                    if(navLeft) navLeft.style.display = 'none';
                    if(navRight) navRight.style.display = 'none';
                    initHomeGallery(); 
                } else {
                    groups[next].style.display = 'flex';
                    if(navLeft) navLeft.style.display = 'block';
                    if(navRight) navRight.style.display = 'block';
                }
                
                window.updateHeader(pageData[next][0], pageData[next][1]);

                if (rootIds[next] && rootIds[next] !== '') {
                    prepareText(next);
                }

                if (next === 4) runLayout('js-gallery-canvas', applyMaximizedLayout);
                if (next === 6) runLayout('js-gallery-canvas-kikyou', applyMaximizedLayoutKikyou);
                if (next === 8) runLayout('js-gallery-canvas-ritsuzen', applyMaximizedLayoutRitsuzen);
                if (next === 10) runLayout('js-gallery-canvas-warmth', applyMaximizedLayoutWarmth);

                setTimeout(() => {
                    groups[next].style.opacity = '1'; 
                    groups[next].classList.add('is-active');
                    
                    if (rootIds[next] && rootIds[next] !== '') {
                        if (next === 11) {
                            setTimeout(() => { startText(); }, 2200); 
                        } else {
                            startText();
                        }
                    }
                    if (next === 9) {
                        const l = document.querySelector('.warmth-logo-img');
                        if(l) { l.classList.remove('warmth-anim-on'); setTimeout(()=>l.classList.add('warmth-anim-on'), 2500); }
                    }
                }, 50);
            }
            currentPage = next;
        }, 500);
    }

    // レイアウト計算関数
    function runLayout(id, func) {
        const c = document.getElementById(id); if(!c) return;
        const i = Array.from(c.querySelectorAll('.g-item-img'));
        const p = i.map(img => new Promise(r => { if(img.complete) r(); else { img.onload=r; img.onerror=r; } }));
        Promise.all(p).then(func);
    }

    /* --- prepareText：余計な改行や空白を無視して1文字ずつ分ける --- */
function prepareText(idx) {
    const rootId = rootIds[idx];
    if (!rootId) return;
    const root = document.getElementById(rootId);
    if (!root) return;
    
    const ps = root.querySelectorAll('.p-text');
    ps.forEach(p => {
        if (p.classList.contains('split-done')) {
            p.querySelectorAll('.char-unit').forEach(s => s.classList.remove('char-lit'));
            return;
        }

        function processNode(node) {
            if (node.nodeType === 3) { // テキストノードの場合
                const text = node.textContent;
                const fragment = document.createDocumentFragment();
                
                // ★修正：改行やインデント用の空白を排除して、純粋な文字だけをスパンにする
                // 1文字ずつバラして、それが改行やタブ（\n, \r, \t）なら無視する
                text.split('').forEach(c => {
                    if (c === '\n' || c === '\r' || c === '\t') return; 
                    
                    const s = document.createElement('span');
                    s.textContent = c;
                    s.className = 'char-unit';
                    fragment.appendChild(s);
                });
                node.replaceWith(fragment);
            } else if (node.nodeType === 1 && node.nodeName !== 'BR') {
                Array.from(node.childNodes).forEach(child => processNode(child));
            }
        }
        Array.from(p.childNodes).forEach(child => processNode(child));
        p.classList.add('split-done');
    });
}

/* --- startText 関数だけをこの内容に差し替えて！ --- */
let charList = [];
function startText() {
    const rootId = rootIds[currentPage];
    if(!rootId) return;
    const root = document.getElementById(rootId);
    
    // すべての .char-unit を取得
    const allUnits = Array.from(root.querySelectorAll('.char-unit'));
    
    // ★ここが解決の鍵：
    // trim() を使って、中身が「空白だけ」の要素を完全にリストから消します。
    // これで、HTMLのインデントによる「謎の待ち時間」がゼロになります。
    charList = allUnits.filter(span => {
        const text = span.textContent.trim();
        return text !== ''; 
    });
    
    let i = 0;
    if (textTimer) clearInterval(textTimer);
    textTimer = setInterval(() => {
        if (i < charList.length) {
            charList[i].classList.add('char-lit');
            i++;
        } else {
            clearInterval(textTimer); 
            textTimer = null;
        }
    }, 60); // プロローグと全く同じ、完璧なリズム！
}
    if(navRight) navRight.addEventListener('click', () => changePage(currentPage + 1));
    if(navLeft) navLeft.addEventListener('click', () => changePage(currentPage - 1));
    const groupSunrise = document.getElementById('group-sunrise');
    if(groupSunrise) groupSunrise.addEventListener('click', () => changePage(12));

    // ★★★ここが修正点：文章エリアをクリックしてもページ移動できるようにする★★★
    document.querySelectorAll('.scroll-container').forEach(c => {
        c.addEventListener('click', (e) => {
            // テキスト選択中は移動しない
            if (window.getSelection().toString().length > 0) return;
            // 画面の半分より左なら戻る、右なら進む
            if (e.clientX < window.innerWidth / 2) changePage(currentPage - 1);
            else changePage(currentPage + 1);
        });
    });

    // 矢印制御
    const prologueScroll = document.querySelector('#group-prologue .scroll-container');
    const indicatorPrologue = document.getElementById('scroll-indicator-prologue');
    if (prologueScroll && indicatorPrologue) {
        prologueScroll.addEventListener('scroll', () => {
            if (prologueScroll.scrollTop > 30) indicatorPrologue.classList.add('is-hidden');
            else indicatorPrologue.classList.remove('is-hidden');
        });
    }
    const aboutScroll = document.querySelector('#group-about .scroll-container');
    const indicatorAbout = document.getElementById('scroll-indicator-about');
    if (aboutScroll && indicatorAbout) {
        aboutScroll.addEventListener('scroll', () => {
            if (aboutScroll.scrollTop > 30) indicatorAbout.classList.add('is-hidden');
            else indicatorAbout.classList.remove('is-hidden');
        });
    }

    /* 8. HOME ロジック */
    const photoList = [];
    for (let i = 1; i <= 30; i++) {
        const num = i.toString().padStart(2, '0');
        photoList.push(`img/photo${num}.jpg`);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /* =========================================
   【修正版】initHomeGallery 関数
   （これを既存の同名関数と差し替えてください）
   ========================================= */
function initHomeGallery() {
    const groupHome = document.getElementById('group-home');
    const homeHeader = document.querySelector('.home-header');
    const colLeft = document.getElementById('home-col-left');
    const colRight = document.getElementById('home-col-right');
    
    if(groupHome) {
        groupHome.scrollTop = 0;
        if(homeHeader) homeHeader.style.opacity = '1';
    }

    // すでに画像が配置されていたら何もしない（再配置防止）
    if (colLeft && colLeft.children.length > 0) return; 
    if (!colLeft || !colRight) return;

    colLeft.innerHTML = '';
    colRight.innerHTML = '';
    const shuffled = shuffleArray([...photoList]);

    // ★ここからが新しいロジック★
    shuffled.forEach((src) => {
        // プラスマーク用の枠を作成
        const wrapper = document.createElement('div');
        wrapper.className = 'home-img-wrapper';
        // 初期状態は透明にしておく（ガタツキ防止）
        wrapper.style.opacity = '0';
        wrapper.style.transition = 'opacity 0.5s ease';

        const img = document.createElement('img');
        img.src = src;
        img.alt = "Archive Photo";
        img.className = "home-img";
        // loading="lazy"だと高さ計算が遅れることがあるので外すか、eagerにする
        img.loading = "eager"; 
        img.decoding = "async"; 
        
        // 画像の読み込みが完了したら実行
        img.onload = function() {
            // 左右の列の現在の高さを比較し、低い方に追加する
            if (colLeft.offsetHeight <= colRight.offsetHeight) {
                colLeft.appendChild(wrapper);
            } else {
                colRight.appendChild(wrapper);
            }
            // 配置が終わったらフワッと表示させる
            requestAnimationFrame(() => {
                wrapper.style.opacity = '1';
            });
        };
        
        img.onerror = function() { wrapper.remove(); }; // エラーなら要素ごと削除
        
        img.addEventListener('click', function(e) {
            e.stopPropagation(); 
            window.openModal(this);
        });

        wrapper.appendChild(img);
        // ※ここではまだ列には追加しない！onloadの中で追加するよ。
    });
}

    const reEnterBtn = document.getElementById('btn-re-enter');
    if(reEnterBtn) {
        reEnterBtn.addEventListener('click', () => { location.reload(); });
    }
    

    
});



window.openModal = function(element) {
    const img = element; 
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    if (img && modal && modalImg) {
        modalImg.src = img.src;
        modal.style.zIndex = "9999"; 
        modal.classList.add('is-open');
    }
}

window.closeModal = function() {
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    if (modal) {
        modal.classList.remove('is-open');
        setTimeout(() => { 
            modal.style.zIndex = "-1"; 
            if(modalImg) modalImg.src = ""; 
        }, 400);
    }
}

// Layout functions
function applyMaximizedLayout() { const c=document.getElementById('js-gallery-canvas'); if(!c)return; const w=Array.from(c.querySelectorAll('.g-item-wrapper')), im=Array.from(c.querySelectorAll('.g-item-img')); if(w.length<5||im.length<5)return; const cw=c.clientWidth-2, ch=c.clientHeight-2, g=15, r=im.map(i=>i.naturalHeight/i.naturalWidth), wr=[0.70,0.70,1.00,0.90,0.80], bw=(cw-g)/(wr[2]+wr[3]), h1=wr[0]*r[0], h2=wr[1]*r[1], h3=wr[2]*r[2], h4=wr[3]*r[3], h5=wr[4]*r[4], oc=h1*0.3, lh=h1+h3+h5, lg=g*2, rh=oc+h2+h4, rg=g, bwl=(ch-lg)/lh, bwr=(ch-rg)/rh, bwh=Math.min(bwl,bwr), bwf=Math.min(bw,bwh), w1=bwf*wr[0], h1f=w1*r[0], w2=bwf*wr[1], h2f=w2*r[1], w3=bwf*wr[2], h3f=w3*r[2], w4=bwf*wr[3], h4f=w4*r[3], w5=bwf*wr[4], h5f=w5*r[4], tw=w3+g+w4, th=Math.max(h1f+g+h3f+g+h5f,(h1f*0.3)+h2f+g+h4f), ox=(cw-tw)/2, oy=(ch-th)/2, set=(el,w,h,x,y)=>{el.style.width=`${Math.floor(w)}px`;el.style.height=`${Math.floor(h)}px`;el.style.left=`${Math.round(x)}px`;el.style.top=`${Math.round(y)}px`;el.classList.add('is-loaded');}; set(w[0],w1,h1f,ox+w3-w1,oy); set(w[1],w2,h2f,ox+w3+g,oy+(h1f*0.3)); set(w[2],w3,h3f,ox,oy+h1f+g); set(w[3],w4,h4f,ox+w3+g,oy+(h1f*0.3)+h2f+g); set(w[4],w5,h5f,ox+w3-w5,oy+h1f+g+h3f+g); }
function applyMaximizedLayoutKikyou() { const c=document.getElementById('js-gallery-canvas-kikyou'); if(!c)return; const w=Array.from(c.querySelectorAll('.g-item-wrapper')), im=Array.from(c.querySelectorAll('.g-item-img')); if(w.length<4||im.length<4)return; const cw=c.clientWidth, ch=c.clientHeight, g=15, r=im.map(i=>i.naturalHeight/i.naturalWidth), wr=[0.75,1.00,0.85,0.75], roc=0.35, bw=(cw-g)/(wr[2]+wr[1]), lh=(wr[0]*r[0])+(wr[2]*r[2]), oc=(wr[0]*r[0])*roc, rh=oc+(wr[1]*r[1])+(wr[3]*r[3]), mh=Math.max(lh,rh), bh=(ch-g)/mh, base=Math.min(bw,bh), w6=base*wr[0], h6=w6*r[0], w7=base*wr[1], h7=w7*r[1], w8=base*wr[2], h8=w8*r[2], w9=base*wr[3], h9=w9*r[3], roy=h6*roc, tw=w8+g+w7, th=Math.max((h6+g+h8),(roy+h7+g+h9)), ox=(cw-tw)/2, oy=(ch-th)/2, set=(el,w,h,x,y)=>{el.style.width=`${Math.round(w)}px`;el.style.height=`${Math.round(h)}px`;el.style.left=`${Math.round(x)}px`;el.style.top=`${Math.round(y)}px`;el.classList.add('is-loaded');}; set(w[0],w6,h6,ox+(w8-w6),oy); set(w[1],w7,h7,ox+w8+g,oy+roy); set(w[2],w8,h8,ox,oy+h6+g); set(w[3],w9,h9,ox+w8+g,oy+roy+h7+g); }
function applyMaximizedLayoutRitsuzen() { const c=document.getElementById('js-gallery-canvas-ritsuzen'); if(!c)return; const w=Array.from(c.querySelectorAll('.g-item-wrapper')), im=Array.from(c.querySelectorAll('.g-item-img')); if(w.length<4||im.length<4)return; const cw=c.clientWidth, ch=c.clientHeight, g=15, r=im.map(i=>i.naturalHeight/i.naturalWidth), wr=[1.20,0.65,0.80,0.80], loc=0.50, bw=(cw-g)/(wr[0]+wr[3]), oc=(wr[0]*r[0])*loc, lh=oc+(wr[0]*r[0])+(wr[2]*r[2]), rh=(wr[1]*r[1])+(wr[3]*r[3]), mh=Math.max(lh,rh), bh=(ch-g)/mh, base=Math.min(bw,bh), w10=base*wr[0], h10=w10*r[0], w11=base*wr[1], h11=w11*r[1], w12=base*wr[2], h12=w12*r[2], w13=base*wr[3], h13=w13*r[3], loy=h10*loc, tw=w10+g+w13, th=Math.max((loy+h10+g+h12),(h11+g+h13)), ox=(cw-tw)/2, oy=(ch-th)/2, set=(el,w,h,x,y)=>{el.style.width=`${Math.round(w)}px`;el.style.height=`${Math.round(h)}px`;el.style.left=`${Math.round(x)}px`;el.style.top=`${Math.round(y)}px`;el.classList.add('is-loaded');}; set(w[0],w10,h10,ox,oy+loy); set(w[1],w11,h11,ox+w10+g,oy); set(w[2],w12,h12,ox+(w10-w12),oy+loy+h10+g); set(w[3],w13,h13,ox+w10+g,oy+h11+g); }
function applyMaximizedLayoutWarmth() { const c=document.getElementById('js-gallery-canvas-warmth'); if(!c)return; const w=Array.from(c.querySelectorAll('.g-item-wrapper')), im=Array.from(c.querySelectorAll('.g-item-img')); if(w.length<5||im.length<5)return; const cw=c.clientWidth, ch=c.clientHeight, g=20, r=im.map(i=>i.naturalHeight/i.naturalWidth), wr=[0.95,1.25,0.95,0.85,1.20], roc=0.35, ml=Math.max(wr[0],wr[1],wr[2]), mr=Math.max(wr[3],wr[4]), twr=ml+mr, bw=(cw-g)/twr, h14=wr[0]*r[0], h15=wr[1]*r[1], h16=wr[2]*r[2], lh=h14+h15+h16, oc=h14*roc, h17=wr[3]*r[3], h18=wr[4]*r[4], rh=oc+h17+h18, mh=Math.max(lh,rh), bh=(ch-g*2)/mh, base=Math.min(bw,bh), W=wr.map(x=>base*x), H=W.map((x,i)=>x*r[i]), roy=H[0]*roc, mwl=Math.max(W[0],W[1],W[2]), mwr=Math.max(W[3],W[4]), tbw=mwl+g+mwr, th=Math.max(H[0]+g+H[1]+g+H[2],roy+H[3]+g+H[4]), sx=(cw-tbw)/2, sy=(ch-th)/2, gax=sx+mwl+(g/2), set=(el,ww,hh,x,y)=>{el.style.width=`${Math.round(ww)}px`;el.style.height=`${Math.round(hh)}px`;el.style.left=`${Math.round(x)}px`;el.style.top=`${Math.round(y)}px`;el.classList.add('is-loaded');}; set(w[0],W[0],H[0],(gax-g/2)-W[0],sy); set(w[1],W[1],H[1],(gax-g/2)-W[1],sy+H[0]+g); set(w[2],W[2],H[2],(gax-g/2)-W[2],sy+H[0]+g+H[1]+g); set(w[3],W[3],H[3],gax+g/2,sy+roy); set(w[4],W[4],H[4],gax+g/2,sy+roy+H[3]+g); }