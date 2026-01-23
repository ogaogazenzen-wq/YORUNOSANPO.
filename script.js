document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // 設定・変数定義
    // =========================================================
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-_"; 
    
    // --- HTML要素の取得 ---
    const enterPage = document.getElementById('enter-page');
    const grid = document.getElementById('noise-grid');
    
    const loaderScreen = document.getElementById('loader-screen');
    const moonCanvas = document.getElementById('moonCanvas');
    
    const mainContent = document.getElementById('main-content');
    const walkCanvas = document.getElementById('walkCanvas');
    const uiBottomWrapper = document.querySelector('.ui-bottom-wrapper'); 
    
    // --- 状態管理変数 ---
    let gridAnimationId;
    // isEnterReady はもう使いませんが、一応残しておいてもエラーにはなりません

    // =========================================================
    // PART 1: グリッドアニメーション (ENTER画面)
    // =========================================================
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

        const total = cols * rows;
        const items = [];
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < total; i++) {
            const div = document.createElement('div');
            div.classList.add('grid-item');
            div.textContent = "_";
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
                items[startIdx + i].target = char;
                items[startIdx + i].isEnter = true;
            }
        });

        startGridAnimation(items);
    }

    function startGridAnimation(items) {
        let frame = 0;
        const updateInterval = 8; 
        const chaosFrames = 90; 
        const resolveFrames = 180; 
        const maxFrames = chaosFrames + resolveFrames;

        function animate() {
            const shouldUpdate = frame % updateInterval === 0;

            if (frame < chaosFrames) {
                const chaosProgress = frame / chaosFrames;
                const density = Math.pow(chaosProgress, 2); 

                items.forEach(item => {
                    if (!item.isActiveNoise && Math.random() < density * 0.2) { 
                             item.isActiveNoise = true;
                             item.el.classList.remove('is-underscore');
                    }
                    if (item.isActiveNoise && shouldUpdate) {
                        item.el.textContent = chars[Math.floor(Math.random() * chars.length)];
                    }
                });
            }
            else {
                const resolveProgress = (frame - chaosFrames) / resolveFrames;
                const threshold = Math.pow(resolveProgress, 3); 
                let allLocked = true;

                items.forEach(item => {
                    if (item.locked) return;
                    if (Math.random() < threshold) {
                        item.locked = true;
                        item.el.textContent = item.target;
                        if (item.isEnter) item.el.classList.add('is-enter');
                        else item.el.classList.add('is-underscore');
                    } else {
                        if (shouldUpdate) item.el.textContent = chars[Math.floor(Math.random() * chars.length)];
                        allLocked = false;
                    }
                });
                if (allLocked && frame >= maxFrames) {
                         finalizeGrid(items);
                         return;
                }
            }
            frame++;
            if (frame <= maxFrames) {
                gridAnimationId = requestAnimationFrame(animate);
            } else {
                finalizeGrid(items);
            }
        }
        gridAnimationId = requestAnimationFrame(animate);
    }

    function finalizeGrid(items) {
        items.forEach(item => {
            if (!item.locked) {
                item.el.textContent = item.target;
                if (item.isEnter) item.el.classList.add('is-enter');
                else item.el.classList.add('is-underscore');
            }
        });
        // もう isReady フラグを待つ必要はありません
    }

    initGrid();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initGrid, 200);
    });


    // =========================================================
    // PART 2: 遷移処理と月の満ち欠け (Loader Screen)
    // =========================================================
    
    const ctx = moonCanvas.getContext('2d');
    const centerX = moonCanvas.width / 2;
    const centerY = moonCanvas.height / 2;
    const radius = 30; 
    
    let moonStartTime;
    let moonAnimId;
    
    const totalMoonDuration = 1000; 
    const cycleDuration = 500; 

    function drawMoon(phase) {
        ctx.clearRect(0, 0, moonCanvas.width, moonCanvas.height);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        if (phase <= 0.5) {
            const fillAmount = phase * 2;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            if (fillAmount <= 0.5) {
                const curveOffset = radius * (1 - fillAmount * 2);
                ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2, false);
                ctx.ellipse(centerX, centerY, curveOffset, radius, 0, Math.PI / 2, -Math.PI / 2, true);
            } else {
                const curveOffset = radius * ((fillAmount - 0.5) * 2);
                ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2, false);
                ctx.ellipse(centerX, centerY, curveOffset, radius, 0, Math.PI / 2, -Math.PI / 2, false);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            const fillAmount = (1 - phase) * 2;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            if (fillAmount >= 0.5) {
                const curveOffset = radius * ((fillAmount - 0.5) * 2);
                ctx.arc(centerX, centerY, radius, Math.PI / 2, -Math.PI / 2, false);
                ctx.ellipse(centerX, centerY, curveOffset, radius, 0, -Math.PI / 2, Math.PI / 2, false);
            } else {
                const curveOffset = radius * (1 - fillAmount * 2);
                ctx.arc(centerX, centerY, radius, Math.PI / 2, -Math.PI / 2, false);
                ctx.ellipse(centerX, centerY, curveOffset, radius, 0, -Math.PI / 2, Math.PI / 2, true);
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    function animateMoon() {
        const currentTime = Date.now();
        const elapsed = currentTime - moonStartTime;

        if (elapsed > totalMoonDuration) {
            finishLoading();
            return;
        }

        const phase = (elapsed % cycleDuration) / cycleDuration;
        drawMoon(phase);
        moonAnimId = requestAnimationFrame(animateMoon);
    }

    function finishLoading() {
        cancelAnimationFrame(moonAnimId);
        loaderScreen.style.opacity = '0';
        
        setTimeout(() => {
            loaderScreen.style.display = 'none';
            document.body.style.overflow = 'auto'; 
            
            mainContent.style.opacity = '1';
            startWalking(); 
            
            if(uiBottomWrapper) {
                setTimeout(() => {
                    uiBottomWrapper.classList.add('is-active');
                }, 100);
            }

        }, 500); 
    }

    // --- Enter画面クリック時のイベント (修正版) ---
    enterPage.addEventListener('click', () => {
        // ★ロック解除！いつでもクリック可能
        
        // もしグリッドアニメーションが動いていたら強制停止（負荷軽減）
        if(gridAnimationId) cancelAnimationFrame(gridAnimationId);
        
        enterPage.style.opacity = '0';
        setTimeout(() => {
            enterPage.style.display = 'none';
            loaderScreen.style.opacity = '1';
            
            moonStartTime = Date.now();
            animateMoon();
        }, 500); 
    });


    // =========================================================
    // PART 3: 歩くピクトグラム (Walking Man)
    // =========================================================
    const wCtx = walkCanvas.getContext('2d');
    
    const manScale = 0.6; 
    const walkSpeed = 0.1; 
    
    let walkTime = 0;
    let walkAnimId;
    let isWalking = false;

    wCtx.strokeStyle = '#ffffff';
    wCtx.lineCap = 'round'; 
    wCtx.lineJoin = 'round'; 
    wCtx.lineWidth = 4; 

    function drawWalker() {
        wCtx.clearRect(0, 0, walkCanvas.width, walkCanvas.height);
        
        const cx = walkCanvas.width / 2;
        const cy = walkCanvas.height / 2;
        
        walkTime += walkSpeed;
        
        const bounce = Math.sin(walkTime * 2) * 2 * manScale;
        const hipX = cx;
        const hipY = cy + 10 * manScale + bounce;
        
        const headX = hipX + 5 * manScale; 
        const headY = hipY - 50 * manScale;
        
        const leftLegAngle = Math.sin(walkTime) * 0.6; 
        const rightLegAngle = Math.sin(walkTime + Math.PI) * 0.6;
        const leftArmAngle = Math.sin(walkTime + Math.PI) * 0.5;
        const rightArmAngle = Math.sin(walkTime) * 0.5;

        wCtx.beginPath();
        
        const headRadius = 12 * manScale;
        wCtx.moveTo(headX + headRadius, headY);
        wCtx.arc(headX, headY, headRadius, 0, Math.PI * 2);
        
        const neckY = headY + headRadius;
        wCtx.moveTo(headX, neckY);
        wCtx.lineTo(hipX, hipY);
        
        function drawLimb(startX, startY, angle, length, isLeg) {
            const j1Len = length * 0.5;
            const j1X = startX + Math.sin(angle) * j1Len;
            const j1Y = startY + Math.cos(angle) * j1Len;
            let angle2 = angle + (isLeg ? 0.2 * Math.sin(walkTime) : -0.3); 
            const endX = j1X + Math.sin(angle) * j1Len;
            const endY = j1Y + Math.cos(angle) * j1Len;
            wCtx.moveTo(startX, startY);
            wCtx.lineTo(endX, endY);
        }

        const legLen = 50 * manScale;
        drawLimb(hipX, hipY, rightLegAngle, legLen, true);
        drawLimb(hipX, hipY, leftLegAngle, legLen, true);
        
        const shoulderY = neckY + 10 * manScale;
        const armLen = 45 * manScale;
        drawLimb(headX, shoulderY, rightArmAngle, armLen, false);
        drawLimb(headX, shoulderY, leftArmAngle, armLen, false);

        wCtx.stroke();
        
        if (isWalking) {
            walkAnimId = requestAnimationFrame(drawWalker);
        }
    }

    function startWalking() {
        if (isWalking) return;
        isWalking = true;
        drawWalker();
    }

    function stopWalking() {
        isWalking = false;
        cancelAnimationFrame(walkAnimId);
    }

    // =========================================================
    // PART 4: 外部操作用
    // =========================================================
    window.updateHeader = function(num, text) {
        const numEl = document.getElementById('ui-number');
        const labelEl = document.getElementById('ui-label');
        if(numEl) numEl.textContent = num;
        if(labelEl) labelEl.textContent = text;
    };
});