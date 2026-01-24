document.addEventListener('DOMContentLoaded', () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-_"; 
    const enterPage = document.getElementById('enter-page');
    const grid = document.getElementById('noise-grid');
    const loaderScreen = document.getElementById('loader-screen');
    const moonCanvas = document.getElementById('moonCanvas');
    const mainContent = document.getElementById('main-content');
    const walkCanvas = document.getElementById('walkCanvas');
    const uiBottomWrapper = document.querySelector('.ui-bottom-wrapper'); 

    let gridAnimationId;

    // --- 1. ENTER演出 (然さんの完璧ロジック復元) ---
    function initGrid() {
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
        const startIdx = (midRow * cols) + (midCol - 3); 
        enterChars.forEach((char, i) => {
            if (items[startIdx + i]) {
                items[startIdx + i].target = char; items[startIdx + i].isEnter = true;
            }
        });
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

    // --- 2. 月のローディング (ellipse立体版) ---
    const ctx = moonCanvas.getContext('2d');
    function drawMoon(phase) {
        const cx = 150, cy = 150, radius = 30;
        ctx.clearRect(0, 0, 300, 300);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath();
        if (phase <= 0.5) {
            const fillAmount = phase * 2;
            const curveOffset = radius * (fillAmount <= 0.5 ? (1 - fillAmount * 2) : ((fillAmount - 0.5) * 2));
            ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI / 2, false);
            ctx.ellipse(cx, cy, curveOffset, radius, 0, Math.PI / 2, -Math.PI / 2, fillAmount <= 0.5);
        } else {
            const fillAmount = (1 - phase) * 2;
            const curveOffset = radius * (fillAmount >= 0.5 ? ((fillAmount - 0.5) * 2) : (1 - fillAmount * 2));
            ctx.arc(cx, cy, radius, Math.PI / 2, -Math.PI / 2, false);
            ctx.ellipse(cx, cy, curveOffset, radius, 0, -Math.PI / 2, Math.PI / 2, fillAmount < 0.5);
        }
        ctx.closePath(); ctx.fill();
    }

    enterPage.addEventListener('click', () => {
        enterPage.style.opacity = '0';
        setTimeout(() => {
            enterPage.style.display = 'none'; loaderScreen.style.opacity = '1';
            let start = Date.now();
            const anim = () => {
                let elapsed = Date.now() - start;
                if (elapsed > 1000) {
                    loaderScreen.style.display = 'none'; mainContent.style.opacity = '1';
                    if(uiBottomWrapper) uiBottomWrapper.classList.add('is-active');
                    return;
                }
                drawMoon((elapsed % 500) / 500); requestAnimationFrame(anim);
            };
            anim();
        }, 500);
    });

    // --- 3. ピクトグラム (腕・脚 描画版) ---
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

    // --- 4. ページ管理 & 文章アニメーション ---
    let currentPage = 0; const totalPages = 4;
    const groups = [ 
        document.getElementById('group-title'), document.getElementById('group-prologue'), 
        document.getElementById('group-about'), document.getElementById('group-sorrow')
    ];
    const pageData = [ ["00", "TITLE"], ["01", "PROLOGUE"], ["02", "ABOUT"], ["03", "SORROW"] ];
    let textTimer; let charList = [];

    window.updateHeader = function(num, txt) {
        const nEl = document.getElementById('ui-number'), lEl = document.getElementById('ui-label');
        let s = 0; const t = setInterval(() => {
            if (s++ < 20) {
                nEl.textContent = chars[Math.floor(Math.random()*chars.length)] + chars[Math.floor(Math.random()*chars.length)];
                lEl.textContent = Array(txt.length).fill().map(()=>chars[Math.floor(Math.random()*chars.length)]).join('');
            } else { clearInterval(t); nEl.textContent = num; lEl.textContent = txt; }
        }, 30);
    };

    function changePage(next) {
        if (next < 0 || next >= totalPages || next === currentPage) return;
        if (textTimer) clearInterval(textTimer);
        groups[currentPage].style.opacity = '0';
        setTimeout(() => {
            groups[currentPage].style.display = 'none'; groups[currentPage].classList.remove('is-active');
            groups[next].style.display = 'flex';
            window.updateHeader(pageData[next][0], pageData[next][1]);
            if (next >= 1) prepareText(next);
            setTimeout(() => {
                groups[next].style.opacity = '1'; groups[next].classList.add('is-active');
                if (next >= 1) startText();
            }, 50);
            currentPage = next;
        }, 500);
    }

    function prepareText(idx) {
        const rootId = ['','prologue-text-root','about-text-root','sorrow-text-root'][idx];
        const root = document.getElementById(rootId);
        const ps = root.querySelectorAll('.p-text'); charList = [];
        ps.forEach(p => {
            if (p.classList.contains('split-done')) {
                p.querySelectorAll('span').forEach(s => { s.classList.remove('char-lit'); charList.push(s); });
                return;
            }
            const nodes = Array.from(p.childNodes); p.innerHTML = '';
            nodes.forEach(node => {
                if (node.nodeType === 3) {
                    node.textContent.split('').forEach(c => { const s = document.createElement('span'); s.textContent = c; p.appendChild(s); charList.push(s); });
                } else if (node.nodeName === 'BR') { p.appendChild(document.createElement('br')); }
                else if (node.nodeType === 1) {
                    const m = document.createElement('span'); m.className = node.className; p.appendChild(m);
                    Array.from(node.childNodes).forEach(inN => {
                        if (inN.nodeType === 3) { inN.textContent.split('').forEach(c => { const s = document.createElement('span'); s.textContent = c; m.appendChild(s); charList.push(s); }); }
                        else if (inN.nodeName === 'BR') { m.appendChild(document.createElement('br')); }
                    });
                }
            });
            p.classList.add('split-done');
        });
    }

    function startText() {
        let i = 0; textTimer = setInterval(() => { if (i < charList.length) charList[i++].classList.add('char-lit'); else clearInterval(textTimer); }, 60);
    }

    document.getElementById('nav-right').addEventListener('click', () => changePage(currentPage + 1));
    document.getElementById('nav-left').addEventListener('click', () => changePage(currentPage - 1));
    document.querySelectorAll('.scroll-container').forEach(c => {
        c.addEventListener('click', (e) => {
            if (window.getSelection().toString().length > 0) return;
            if (e.clientX < window.innerWidth / 2) changePage(currentPage - 1);
            else changePage(currentPage + 1);
        });
    });
});