/* ============================================
   UI.JS - Renderizado y Librería de Mobiliario
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const state = new AppState();
    const calculator = new SpaceCalculator(state);

    const viewport = document.querySelector('.viewport');
    const gondola3d = document.getElementById('gondola-3d');
    const catalogList = document.getElementById('catalog-list');
    const libraryList = document.getElementById('library-list');
    
    const inputs = {
        type: document.getElementById('input-type'),
        width: document.getElementById('input-width'),
        height: document.getElementById('input-height'),
        depth: document.getElementById('input-depth'),
        numShelves: document.getElementById('input-num-shelves'),
        gap: document.getElementById('input-gap'),
        baseHeight: document.getElementById('input-base-height')
    };

    const stats = {
        value: document.getElementById('stat-total-value'),
        units: document.getElementById('stat-total-units'),
        skus: document.getElementById('stat-total-skus')
    };

    // --- Login & Store Flow ---
    const loginScreen = document.getElementById('login-screen');
    const storeSelectorScreen = document.getElementById('store-selector-screen');
    const mainApp = document.getElementById('main-app');

    function init() {
        setupEventListeners();
        setupLoginAndStores();
    }

    function setupLoginAndStores() {
        const checkLogin = () => {
            const user = document.getElementById('login-username').value.trim().toLowerCase();
            const pass = document.getElementById('login-password').value.trim();
            if (user === 'admin' && pass === 'admin123') {
                loginScreen.style.display = 'none';
                storeSelectorScreen.style.display = 'flex';
                renderStoreList();
            } else {
                document.getElementById('login-error').style.display = 'block';
            }
        };

        document.getElementById('btn-login').addEventListener('click', checkLogin);
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkLogin();
        });
        document.getElementById('login-username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkLogin();
        });

        const createStoreForm = document.getElementById('create-store-form');
        document.getElementById('btn-show-create-store').addEventListener('click', () => {
            createStoreForm.style.display = 'block';
        });
        document.getElementById('btn-cancel-create-store').addEventListener('click', () => {
            createStoreForm.style.display = 'none';
            document.getElementById('new-store-name').value = '';
        });

        document.getElementById('btn-back-stores').addEventListener('click', () => {
            mainApp.style.display = 'none';
            document.getElementById('store-details-screen').style.display = 'block';
            renderStoreDetails();
        });

        document.getElementById('btn-back-to-stores-list').addEventListener('click', () => {
            document.getElementById('store-details-screen').style.display = 'none';
            storeSelectorScreen.style.display = 'flex';
            renderStoreList();
        });

        document.getElementById('btn-create-gondola').addEventListener('click', () => {
            const name = prompt('Nombre de la Góndola:', 'Nueva Góndola');
            if (name) {
                state.createNewGondola(name);
                document.getElementById('store-details-screen').style.display = 'none';
                mainApp.style.display = 'grid';
                initAppContent();
            }
        });

        document.getElementById('btn-global-report').addEventListener('click', () => {
            generateGlobalReport();
            document.getElementById('report-modal').style.display = 'grid';
        });

        document.getElementById('btn-create-store').addEventListener('click', () => {
            const name = document.getElementById('new-store-name').value.trim();
            if (name) {
                state.createStore(name);
                createStoreForm.style.display = 'none';
                document.getElementById('new-store-name').value = '';
                renderStoreList();
            }
        });

        document.getElementById('btn-logout-main').addEventListener('click', () => {
            storeSelectorScreen.style.display = 'none';
            loginScreen.style.display = 'flex';
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
        });
    }

    function renderStoreList() {
        const storeList = document.getElementById('store-list');
        storeList.innerHTML = '';
        if (state.stores.length === 0) {
            storeList.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 40px;">No hay tiendas creadas. Crea una para comenzar.</p>';
            return;
        }

        state.stores.forEach(s => {
            const el = document.createElement('div');
            el.className = 'store-card';
            const date = new Date(s.createdAt).toLocaleDateString();
            const presetsCount = s.library ? s.library.length : 0;

            // Count total units across all gondolas for this store
            let storeTotalUnits = 0;
            if (s.library) {
                s.library.forEach(g => {
                    g.config.shelves.forEach(shelf => {
                        shelf.products.forEach(p => {
                            let layersToProcess = p.layers;
                            if (!layersToProcess && p.productId) {
                                layersToProcess = [];
                                for (let i = 0; i < (p.stacks || 1); i++) {
                                    layersToProcess.push({ productId: p.productId, facings: p.facings, orientation: p.orientation || 0 });
                                }
                            }
                            if (layersToProcess) {
                                layersToProcess.forEach(layer => {
                                    const product = state.getProductById(layer.productId);
                                    if (product) {
                                        const dims = state.getPlacedDimensions(layer.productId, layer.orientation || 0);
                                        storeTotalUnits += layer.facings * Math.floor(g.config.shelfDepth / dims.depth);
                                    }
                                });
                            }
                        });
                    });
                });
            }

            el.innerHTML = `
                <div class="store-card-content">
                    <div class="store-card-header">
                        <div class="store-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/></svg>
                        </div>
                        <div style="flex: 1;">
                            <h3>${s.name}</h3>
                            <p>${presetsCount} góndola${presetsCount !== 1 ? 's' : ''} · ${storeTotalUnits} unidades</p>
                        </div>
                    </div>
                    <div class="meta">
                        <span class="pill-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${date}</span>
                        <span class="pill-badge">ID: ${s.id.split('-')[1].slice(0, 6)}</span>
                    </div>
                    <div class="store-card-actions">
                        <button class="btn-store-report" data-store-id="${s.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                            Reporte
                        </button>
                        <button class="btn-enter-store" data-store-id="${s.id}">
                            Gestionar →
                        </button>
                    </div>
                </div>
            `;
            
            el.querySelector('.btn-enter-store').addEventListener('click', (e) => {
                e.stopPropagation();
                state.selectStore(s.id);
                document.getElementById('details-store-name').innerText = s.name;
                document.getElementById('header-store-name').innerText = '- ' + s.name;
                storeSelectorScreen.style.display = 'none';
                document.getElementById('store-details-screen').style.display = 'block';
                renderStoreDetails();
            });

            el.querySelector('.btn-store-report').addEventListener('click', (e) => {
                e.stopPropagation();
                state.selectStore(s.id);
                generateInlineReport(s);
            });

            storeList.appendChild(el);
        });
    }

    function renderStoreDetails() {
        const gondolaList = document.getElementById('gondola-list');
        gondolaList.innerHTML = '';
        const store = state.stores.find(s => s.id === state.currentStoreId);
        
        if (!store || !store.library || store.library.length === 0) {
            gondolaList.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 40px;">No hay góndolas en esta tienda. Crea una nueva.</p>';
            return;
        }

        store.library.forEach(g => {
            const el = document.createElement('div');
            el.className = 'store-card';
            
            // Calculate total units in this gondola for a quick stat
            let totalUnits = 0;
            g.config.shelves.forEach(s => {
                s.products.forEach(p => {
                    let layersToProcess = p.layers;
                    if (!layersToProcess && p.productId) {
                        layersToProcess = [];
                        for (let i = 0; i < (p.stacks || 1); i++) {
                            layersToProcess.push({ productId: p.productId, facings: p.facings, orientation: p.orientation || 0 });
                        }
                    }
                    if (layersToProcess) {
                        layersToProcess.forEach(layer => {
                            const product = state.getProductById(layer.productId);
                            if (product) {
                                const dims = state.getPlacedDimensions(layer.productId, layer.orientation || 0);
                                totalUnits += layer.facings * Math.floor(g.config.shelfDepth / dims.depth);
                            }
                        });
                    }
                });
            });

            let typeLabel = g.config.type === 'pared' ? 'Góndola Pared' : g.config.type === 'central' ? 'Góndola Central' : g.config.type === 'cabecera' ? 'Cabecera' : 'Refrigerado';

            el.innerHTML = `
                <div class="store-card-content">
                    <div class="store-card-header">
                        <div class="store-card-icon" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); color: #10b981;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/></svg>
                        </div>
                        <div style="flex: 1;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <h3 style="margin-bottom:2px;">${g.name}</h3>
                                <button class="btn-delete-gondola" data-id="${g.id}" style="background:rgba(239, 68, 68, 0.1); border:none; color:#ef4444; border-radius:6px; cursor:pointer; padding:6px; transition:all 0.2s; display:grid; place-items:center;" title="Eliminar góndola">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                            <p style="font-size:11px;">${g.config.width}x${g.config.height}x${g.config.depth} cm</p>
                        </div>
                    </div>
                    <div class="meta">
                        <span class="pill-badge" style="color: #10b981; background: rgba(16, 185, 129, 0.15);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg> ${totalUnits} Unidades</span>
                        <span style="font-size: 11px; display:flex; align-items:center; gap:4px; color:var(--text-muted); font-weight:600;">${typeLabel}</span>
                    </div>
                </div>
            `;
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-delete-gondola')) return;
                state.loadGondola(g.id);
                document.getElementById('store-details-screen').style.display = 'none';
                mainApp.style.display = 'grid';
                initAppContent();
            });
            el.querySelector('.btn-delete-gondola').addEventListener('click', (e) => {
                if(confirm('¿Seguro que deseas eliminar esta góndola?')) {
                    state.deleteGondola(g.id);
                    renderStoreDetails();
                }
            });
            gondolaList.appendChild(el);
        });
    }

    function initAppContent() {
        // Sync inputs to the current store's gondola
        Object.keys(inputs).forEach(key => {
            if (key === 'gap' && inputs[key]) inputs[key].value = state.gondola.gapBetweenShelves;
            else if (inputs[key]) inputs[key].value = state.gondola[key];
        });

        renderGondola();
        renderCatalog();
        updateDashboard();
    }

    function renderGondola() {
        const g = state.gondola;
        const scale = 3;

        gondola3d.style.width = `${g.width * scale}px`;
        gondola3d.style.height = `${g.height * scale}px`;
        gondola3d.innerHTML = '';

        // === Type-specific visual structures ===
        const typeColors = {
            pared:       { back: '#1e293b', shelf: '#475569', shelfTop: '#64748b', shelfFront: '#334155', border: '#334155', accent: 'rgba(255,255,255,0.03)' },
            central:     { back: 'transparent', shelf: '#78716c', shelfTop: '#a8a29e', shelfFront: '#57534e', border: '#44403c', accent: 'rgba(168,162,158,0.08)' },
            cabecera:    { back: '#1c1917', shelf: '#44403c', shelfTop: '#57534e', shelfFront: '#292524', border: '#57534e', accent: 'rgba(251,146,60,0.05)' },
            refrigerado: { back: '#0c1929', shelf: '#1e3a5f', shelfTop: '#2563eb', shelfFront: '#1e40af', border: '#3b82f6', accent: 'rgba(59,130,246,0.06)' }
        };
        const tc = typeColors[g.type] || typeColors.pared;

        // Back Panel
        const backPanel = document.createElement('div');
        backPanel.className = 'gondola-back-panel';
        backPanel.style.width = '100%';
        backPanel.style.height = '100%';
        backPanel.style.position = 'absolute';
        backPanel.style.top = '0';
        backPanel.style.left = '0';

        if (g.type === 'pared') {
            backPanel.style.background = `linear-gradient(180deg, #1e293b 0%, #0f172a 100%)`;
            backPanel.style.borderLeft = `3px solid ${tc.border}`;
            backPanel.style.borderRight = `3px solid ${tc.border}`;
            backPanel.style.boxShadow = 'inset 0 0 60px rgba(0,0,0,0.4)';
            // Vertical columns
            const colL = document.createElement('div');
            colL.style.cssText = `position:absolute; left:-6px; top:0; width:6px; height:100%; background:#334155; transform-style:preserve-3d;`;
            const colLSide = document.createElement('div');
            colLSide.style.cssText = `position:absolute; width:${g.depth * scale}px; height:100%; background:#2d3a4a; transform:rotateY(90deg); transform-origin:left;`;
            colL.appendChild(colLSide);
            gondola3d.appendChild(colL);

            const colR = document.createElement('div');
            colR.style.cssText = `position:absolute; right:-6px; top:0; width:6px; height:100%; background:#334155; transform-style:preserve-3d;`;
            const colRSide = document.createElement('div');
            colRSide.style.cssText = `position:absolute; width:${g.depth * scale}px; height:100%; background:#2d3a4a; transform:rotateY(-90deg); transform-origin:right;`;
            colR.appendChild(colRSide);
            gondola3d.appendChild(colR);

        } else if (g.type === 'central') {
            backPanel.style.background = 'transparent';
            backPanel.style.borderLeft = `4px solid #78716c`;
            backPanel.style.borderRight = `4px solid #78716c`;
            // Metal posts at corners
            ['left:-8px', 'right:-8px'].forEach(pos => {
                const post = document.createElement('div');
                post.style.cssText = `position:absolute; ${pos}; top:0; width:8px; height:100%; background:linear-gradient(180deg, #a8a29e, #78716c); border-radius:2px; transform-style:preserve-3d;`;
                const postDepth = document.createElement('div');
                postDepth.style.cssText = `position:absolute; width:${g.depth * scale}px; height:100%; background:#57534e; transform:rotateY(${pos.startsWith('left') ? '' : '-'}90deg); transform-origin:${pos.startsWith('left') ? 'left' : 'right'};`;
                post.appendChild(postDepth);
                gondola3d.appendChild(post);
            });

        } else if (g.type === 'cabecera') {
            backPanel.style.background = `linear-gradient(180deg, #292524 0%, #1c1917 100%)`;
            backPanel.style.border = `2px solid ${tc.border}`;
            backPanel.style.borderRadius = '4px';
            // Orange accent strip at top
            const accent = document.createElement('div');
            accent.style.cssText = `position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, #f97316, #fb923c, #f97316); border-radius:2px 2px 0 0;`;
            backPanel.appendChild(accent);

        } else if (g.type === 'refrigerado') {
            backPanel.style.background = `linear-gradient(180deg, #0c1929 0%, #0a1628 100%)`;
            backPanel.style.border = `3px solid ${tc.border}`;
            backPanel.style.borderRadius = '6px';
            backPanel.style.boxShadow = `inset 0 0 80px rgba(59,130,246,0.08), 0 0 30px rgba(59,130,246,0.1)`;
            // Blue glow strip at top
            const glow = document.createElement('div');
            glow.style.cssText = `position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent);`;
            backPanel.appendChild(glow);
            // Glass side panel
            const glass = document.createElement('div');
            glass.style.cssText = `position:absolute; top:0; right:0; width:${g.depth * scale}px; height:100%; background:rgba(59,130,246,0.04); border:1px solid rgba(59,130,246,0.15); transform:rotateY(-90deg); transform-origin:right; backdrop-filter:blur(2px);`;
            backPanel.appendChild(glass);
        }

        gondola3d.appendChild(backPanel);

        g.shelves.forEach((shelf, idx) => {
            const isPerchero = shelf.type === 'perchero';

            // If it is a perchero level, render a dotted pegboard panel on the back panel at this height
            if (isPerchero) {
                const usableH = state.getShelfUsableHeight(idx);
                const pegboard = document.createElement('div');
                pegboard.className = 'pegboard-panel';
                pegboard.style.cssText = `
                    position: absolute;
                    left: 0;
                    bottom: ${(shelf.y + g.shelfThickness) * scale}px;
                    width: 100%;
                    height: ${usableH * scale}px;
                    background: radial-gradient(rgba(255,255,255,0.15) 15%, transparent 15%) 0 0,
                                radial-gradient(rgba(255,255,255,0.15) 15%, transparent 15%) 8px 8px;
                    background-color: #1e293b;
                    background-size: 16px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    transform: translateZ(0.5px);
                    transition: background-color 0.2s;
                `;
                
                // Add drag and drop listeners directly to the pegboard so it acts as a drop target too!
                pegboard.addEventListener('dragover', (e) => { 
                    e.preventDefault(); 
                    pegboard.style.backgroundColor = 'rgba(99, 102, 241, 0.15)'; 
                });
                pegboard.addEventListener('dragleave', () => { 
                    pegboard.style.backgroundColor = '#1e293b'; 
                });
                pegboard.addEventListener('drop', (e) => {
                    e.preventDefault();
                    pegboard.style.backgroundColor = '#1e293b';
                    const productId = e.dataTransfer.getData('text/plain');
                    const result = state.placeProduct(idx, productId);
                    if (!result.success) alert(result.reason);
                });

                gondola3d.appendChild(pegboard);
            }

            const shelfEl = document.createElement('div');
            shelfEl.className = 'shelf-3d';
            shelfEl.style.width = `${g.width * scale}px`;
            shelfEl.style.height = `${(isPerchero ? 1 : g.shelfThickness) * scale}px`;
            shelfEl.style.bottom = `${shelf.y * scale}px`;
            shelfEl.style.left = '0px';
            shelfEl.style.transform = `translateZ(0px)`;
            shelfEl.style.background = isPerchero ? '#475569' : tc.shelf;
            shelfEl.style.borderColor = isPerchero ? '#334155' : `${tc.border}`;

            // Drag and Drop
            shelfEl.addEventListener('dragover', (e) => { e.preventDefault(); shelfEl.classList.add('drag-over'); });
            shelfEl.addEventListener('dragleave', () => { shelfEl.classList.remove('drag-over'); });
            shelfEl.addEventListener('drop', (e) => {
                e.preventDefault();
                shelfEl.classList.remove('drag-over');
                const productId = e.dataTransfer.getData('text/plain');
                const result = state.placeProduct(idx, productId);
                if (!result.success) alert(result.reason);
            });

            const top = document.createElement('div');
            top.className = 'shelf-top';
            top.style.height = `${(isPerchero ? 2 : g.shelfDepth) * scale}px`;
            top.style.background = isPerchero ? '#64748b' : tc.shelfTop;
            shelfEl.appendChild(top);

            const front = document.createElement('div');
            front.className = 'shelf-front';
            front.style.transform = `translateZ(${(isPerchero ? 2 : g.shelfDepth) * scale}px)`;
            front.style.background = isPerchero ? '#334155' : tc.shelfFront;
            shelfEl.appendChild(front);

            // Hook rods render for perchero
            if (isPerchero) {
                shelf.products.forEach((p) => {
                    let layersToProcess = p.layers;
                    if (!layersToProcess || layersToProcess.length === 0) return;
                    const layer = layersToProcess[0];
                    const dims = state.getPlacedDimensions(layer.productId, layer.orientation || 0);

                    // Hook rod extending forward
                    const hook = document.createElement('div');
                    hook.style.cssText = `
                        position: absolute;
                        left: ${(p.x + (dims.width * layer.facings) / 2) * scale - 2}px;
                        bottom: ${(shelf.y + dims.height * 0.85) * scale}px;
                        width: 4px;
                        height: 4px;
                        background: #cbd5e1;
                        transform-style: preserve-3d;
                        transform: translateZ(0px);
                        pointer-events: none;
                    `;

                    const rod = document.createElement('div');
                    rod.style.cssText = `
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: linear-gradient(90deg, #94a3b8, #cbd5e1, #94a3b8);
                        transform: rotateY(90deg);
                        transform-origin: left;
                        width: ${g.shelfDepth * scale}px;
                        box-shadow: 0 5px 5px rgba(0,0,0,0.3);
                    `;
                    hook.appendChild(rod);
                    
                    const tip = document.createElement('div');
                    tip.style.cssText = `
                        position: absolute;
                        left: ${g.shelfDepth * scale}px;
                        bottom: 0;
                        width: 4px;
                        height: 8px;
                        background: #cbd5e1;
                        transform: rotateX(-45deg);
                    `;
                    hook.appendChild(tip);

                    gondola3d.appendChild(hook);
                });
            }

            shelf.products.forEach((p, pIdx) => {
                let layersToProcess = p.layers;
                // Retrocompatibilidad visual
                if (!layersToProcess) {
                    if (p.productId) {
                        layersToProcess = [];
                        for(let i=0; i < (p.stacks || 1); i++) {
                            layersToProcess.push({ productId: p.productId, facings: p.facings, orientation: p.orientation || 0 });
                        }
                        // Auto-migrate in memory
                        p.layers = layersToProcess;
                    } else {
                        return;
                    }
                }
                
                if (layersToProcess.length === 0) return;

                const placementEl = document.createElement('div');
                placementEl.className = 'placement-wrapper';
                placementEl.style.position = 'absolute';
                placementEl.style.left = `${p.x * scale}px`;
                placementEl.style.bottom = `${g.shelfThickness * scale}px`;
                placementEl.style.transformStyle = 'preserve-3d';

                let currentY = 0;

                p.layers.forEach((layer, lIdx) => {
                    const product = state.getProductById(layer.productId);
                    if (!product) return;

                    const dims = state.getPlacedDimensions(layer.productId, layer.orientation || 0);

                    const unitsInZ = Math.floor(g.shelfDepth / dims.depth);
                    const visualDepth = unitsInZ * dims.depth * scale;
                    
                    const layerEl = document.createElement('div');
                    layerEl.className = 'placed-product';
                    layerEl.style.width = `${dims.width * scale * layer.facings}px`;
                    layerEl.style.height = `${dims.height * scale}px`;
                    layerEl.style.bottom = `${currentY * scale}px`;
                    layerEl.style.left = `0px`;
                    layerEl.style.transform = `translateZ(${g.shelfDepth * scale - visualDepth}px)`;

                    const hoverBadge = document.createElement('div');
                    hoverBadge.className = 'simple-hover-badge';
                    hoverBadge.innerHTML = `Z: ${unitsInZ} | Capa: ${lIdx + 1}`;
                    hoverBadge.style.setProperty('--badge-z', `${visualDepth + 10}px`);
                    layerEl.appendChild(hoverBadge);

                    layerEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openProductModal(product, layer, idx, pIdx, unitsInZ, dims, lIdx);
                    });

                    const box = document.createElement('div');
                    box.className = 'product-box';
                    
                    const unitW = dims.width * scale;
                    const unitH = dims.height * scale;
                    const unitD = dims.depth * scale;
                    const gridBg = `linear-gradient(to right, rgba(0,0,0,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.25) 1px, transparent 1px)`;

                    const faceFront = document.createElement('div');
                    faceFront.className = 'face face-front';
                    faceFront.style.background = `${gridBg}, ${product.color}`;
                    faceFront.style.backgroundSize = `${unitW}px ${unitH}px`;
                    faceFront.style.transform = `translateZ(${visualDepth}px)`;
                    faceFront.innerHTML = `${layer.facings > 1 ? layer.facings + 'X' : ''}`;
                    if (isPerchero) {
                        const hole = document.createElement('div');
                        hole.style.cssText = `
                            position: absolute;
                            top: 4px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 6px;
                            height: 6px;
                            background: #0f172a;
                            border-radius: 50%;
                            border: 1px solid rgba(255,255,255,0.2);
                        `;
                        faceFront.appendChild(hole);
                    }
                    box.appendChild(faceFront);

                    const faceTop = document.createElement('div');
                    faceTop.className = 'face face-top';
                    faceTop.style.background = `${gridBg}, ${product.color}`;
                    faceTop.style.backgroundSize = `${unitW}px ${unitD}px`;
                    faceTop.style.height = `${visualDepth}px`;
                    box.appendChild(faceTop);

                    const faceSide = document.createElement('div');
                    faceSide.className = 'face face-side';
                    faceSide.style.background = `${gridBg}, ${product.color}`;
                    faceSide.style.backgroundSize = `${unitD}px ${unitH}px`;
                    faceSide.style.width = `${visualDepth}px`;
                    box.appendChild(faceSide);

                    const faceLeft = document.createElement('div');
                    faceLeft.className = 'face face-left';
                    faceLeft.style.background = `${gridBg}, ${product.color}`;
                    faceLeft.style.backgroundSize = `${unitD}px ${unitH}px`;
                    faceLeft.style.width = `${visualDepth}px`;
                    box.appendChild(faceLeft);

                    layerEl.appendChild(box);

                    layerEl.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); layerEl.style.boxShadow = '0 0 15px gold'; });
                    layerEl.addEventListener('dragleave', () => { layerEl.style.boxShadow = 'none'; });
                    layerEl.addEventListener('drop', (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const droppedProductId = e.dataTransfer.getData('text/plain');
                        const result = state.stackProduct(idx, pIdx, droppedProductId);
                        if (!result.success) alert(result.reason);
                    });

                    layerEl.addEventListener('dblclick', (e) => { e.stopPropagation(); state.removeFromShelf(idx, pIdx, lIdx); });
                    
                    placementEl.appendChild(layerEl);
                    currentY += dims.height;
                });

                shelfEl.appendChild(placementEl);
            });

            gondola3d.appendChild(shelfEl);
        });

        renderShelfTypesControls();
    }

    function renderShelfTypesControls() {
        const container = document.getElementById('shelf-types-container');
        const group = document.getElementById('group-shelf-types');
        if (!container || !group) return;

        const g = state.gondola;
        if (!g.shelves || g.shelves.length === 0) {
            group.style.display = 'none';
            return;
        }

        group.style.display = 'block';
        container.innerHTML = '';

        [...g.shelves].reverse().forEach(shelf => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:12px; background:rgba(255,255,255,0.02); padding:6px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);';
            
            const label = document.createElement('span');
            label.innerText = `Nivel ${shelf.index + 1}`;
            label.style.fontWeight = '600';
            
            const select = document.createElement('select');
            select.style.cssText = 'background:#0f172a; border:1px solid var(--border); color:white; border-radius:4px; padding:3px 6px; font-size:11px;';
            select.innerHTML = `
                <option value="plancha" ${shelf.type === 'plancha' ? 'selected' : ''}>Plancha</option>
                <option value="perchero" ${shelf.type === 'perchero' ? 'selected' : ''}>Perchero</option>
            `;
            
            select.addEventListener('change', (e) => {
                state.setShelfType(shelf.index, e.target.value);
            });

            row.appendChild(label);
            row.appendChild(select);
            container.appendChild(row);
        });
    }

    function renderLibrary() {
        libraryList.innerHTML = '';
        state.library.forEach(p => {
            const el = document.createElement('div');
            el.style.cssText = 'background:rgba(255,255,255,0.05); padding:8px; border-radius:4px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; cursor:pointer;';
            el.innerHTML = `
                <div style="flex:1;">
                    <div style="font-size:11px; font-weight:600;">${p.name}</div>
                    <div style="font-size:9px; color:var(--text-muted);">${p.config.type.toUpperCase()} | ${p.config.width}x${p.config.height}</div>
                </div>
                <button class="delete-preset" data-id="${p.id}" style="background:transparent; border:none; color:#ef4444; cursor:pointer; padding:4px;">&times;</button>
            `;
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-preset')) return;
                state.loadPreset(p.id);
                Object.keys(inputs).forEach(key => {
                    if (key === 'gap') inputs[key].value = state.gondola.gapBetweenShelves;
                    else if (inputs[key]) inputs[key].value = state.gondola[key];
                });
            });
            el.querySelector('.delete-preset').addEventListener('click', (e) => {
                state.deletePreset(p.id);
            });
            libraryList.appendChild(el);
        });
    }

    function renderCatalog() {
        catalogList.innerHTML = '';
        const categories = {};
        state.products.forEach(p => {
            if (!categories[p.category]) categories[p.category] = [];
            categories[p.category].push(p);
        });

        Object.keys(categories).forEach(cat => {
            const header = document.createElement('div');
            header.style.cssText = 'font-size:11px; font-weight:700; color:var(--primary); text-transform:uppercase; margin:20px 0 10px 0; border-bottom:1px solid rgba(99,102,241,0.2); padding-bottom:4px;';
            header.innerText = cat;
            catalogList.appendChild(header);

            categories[cat].forEach(p => {
                const el = document.createElement('div');
                el.className = 'draggable-product';
                el.draggable = true;
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <span style="font-size:10px; color:var(--text-muted);">${p.sku}</span>
                        <span style="font-size:11px; font-weight:700; color:white;">$${p.price.toFixed(2)}</span>
                    </div>
                    <div style="font-weight:600; font-size:13px; margin:4px 0;">${p.name}</div>
                    <div style="display:flex; gap:8px; font-size:9px; color:var(--text-muted);">
                        <span>${p.width}x${p.height}x${p.depth} cm</span>
                        <span style="color:${p.color}; opacity:0.8;">■ Color</span>
                    </div>
                `;
                el.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', p.id); el.style.opacity = '0.5'; });
                el.addEventListener('dragend', () => { el.style.opacity = '1'; });
                catalogList.appendChild(el);
            });
        });
    }

    function updateDashboard() {
        const statsData = calculator.getGlobalStats();
        stats.value.innerText = `$${statsData.totalValue.toFixed(2)}`;
        stats.units.innerText = statsData.totalUnits;
        stats.skus.innerText = statsData.totalSKUs;
    }

    function setupEventListeners() {
        // Rotation & Zoom via Mouse Drag and Wheel
        let currentRotateX = -10;
        let currentRotateY = -20;
        let currentZoom = 1;
        let isDragging = false;
        let startMouseX = 0;
        let startMouseY = 0;
        let startRotateX = 0;
        let startRotateY = 0;

        const resetView = document.getElementById('reset-view');

        const updateTransform = () => {
            gondola3d.style.transform = `scale(${currentZoom}) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
        };

        if(resetView) {
            resetView.addEventListener('click', () => {
                currentRotateX = -10;
                currentRotateY = -20;
                currentZoom = 1;
                updateTransform();
            });
        }

        const viewportContainer = document.querySelector('.viewport');
        
        // Prevent default context menu on right click
        viewportContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        viewportContainer.addEventListener('mousedown', (e) => {
            // Only allow right click (button 2) to rotate
            if (e.button !== 2) return;
            if(e.target.closest('button') || e.target.closest('input') || e.target.closest('.draggable-product')) return;
            
            isDragging = true;
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            startRotateX = currentRotateX;
            startRotateY = currentRotateY;
            viewportContainer.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startMouseX;
            const deltaY = e.clientY - startMouseY;
            
            currentRotateY = startRotateY + deltaX * 0.5;
            currentRotateX = startRotateX - deltaY * 0.5;
            
            currentRotateX = Math.max(-60, Math.min(60, currentRotateX));
            
            updateTransform();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            viewportContainer.style.cursor = 'default';
        });

        viewportContainer.addEventListener('wheel', (e) => {
            if(e.target.closest('.dashboard-overlay')) return;
            
            e.preventDefault();
            const zoomSpeed = 0.05;
            if (e.deltaY < 0) {
                currentZoom += zoomSpeed;
            } else {
                currentZoom -= zoomSpeed;
            }
            currentZoom = Math.max(0.3, Math.min(3.0, currentZoom));
            updateTransform();
        }, { passive: false });
        
        updateTransform();

        // Inputs Sync
        const dimPreset = document.getElementById('input-dim-preset');
        if (dimPreset) {
            dimPreset.addEventListener('change', (e) => {
                if (e.target.value === 'custom') return;
                const [w, h, d] = e.target.value.split('x').map(Number);
                inputs.width.value = w;
                inputs.height.value = h;
                inputs.depth.value = d;
                state.updateGondola({ width: w, height: h, depth: d, shelfWidth: w, shelfDepth: d });
            });
        }

        Object.keys(inputs).forEach(key => {
            if (!inputs[key]) return;
            inputs[key].addEventListener('change', (e) => {
                if (key === 'type') {
                    const type = e.target.value;
                    const presets = {
                        central: { width: 120, height: 150, depth: 45, baseHeight: 15, numShelves: 4 },
                        cabecera: { width: 90, height: 150, depth: 35, baseHeight: 15, numShelves: 4 },
                        pared: { width: 100, height: 210, depth: 40, baseHeight: 20, numShelves: 5 },
                        refrigerado: { width: 180, height: 200, depth: 65, baseHeight: 25, numShelves: 4 }
                    };
                    const preset = presets[type];
                    if (preset) {
                        inputs.width.value = preset.width;
                        inputs.height.value = preset.height;
                        inputs.depth.value = preset.depth;
                        inputs.baseHeight.value = preset.baseHeight;
                        inputs.numShelves.value = preset.numShelves;
                        
                        state.updateGondola({
                            type: type,
                            width: preset.width,
                            height: preset.height,
                            depth: preset.depth,
                            baseHeight: preset.baseHeight,
                            numShelves: preset.numShelves
                        });
                    }
                    return;
                }

                const val = parseFloat(e.target.value);
                const updates = {};
                if (key === 'gap') updates.gapBetweenShelves = val;
                else updates[key] = val;
                
                if (dimPreset && ['width', 'height', 'depth'].includes(key)) {
                    dimPreset.value = 'custom';
                }
                state.updateGondola(updates);
            });
        });

        // Duplicate Gondola
        const btnDup = document.getElementById('btn-duplicate-gondola');
        if (btnDup) {
            btnDup.addEventListener('click', () => {
                state.duplicateGondola();
            });
        }

        // Report
        document.getElementById('btn-report').addEventListener('click', () => {
            generateReport();
            document.getElementById('report-modal').style.display = 'grid';
        });
        document.getElementById('close-report').addEventListener('click', () => { document.getElementById('report-modal').style.display = 'none'; });

        // PDF Download
        const btnDownload = document.getElementById('btn-download-pdf');
        if (btnDownload) {
            btnDownload.addEventListener('click', downloadPDF);
        }

        state.on('gondola:updated', renderGondola);
        state.on('dashboard:update', updateDashboard);
    }

    function generateGlobalReport() {
        const store = state.stores.find(s => s.id === state.currentStoreId);
        const reportContent = document.getElementById('report-content');
        
        if (!store || !store.library || store.library.length === 0) {
            reportContent.innerHTML = '<p>No hay góndolas en esta tienda para reportar.</p>';
            return;
        }

        let html = `<h3 style="margin-bottom: 16px;">Reporte Global: ${store.name}</h3>`;
        html += '<table class="report-table" id="report-table" style="width: 100%; border-collapse: collapse;"><thead><tr style="background: var(--primary); color: white;"><th>SKU</th><th>Nombre</th><th>Cantidad</th><th>Precio Unit.</th><th>Valor Total</th></tr></thead><tbody>';
        
        let grandTotalUnits = 0;
        let grandTotalValue = 0;
        let grandUniqueSkus = new Set();

        store.library.forEach(g => {
            let gondolaHasProducts = false;
            let gondolaTotalUnits = 0;
            let gondolaTotalValue = 0;
            
            let gondolaHtml = `<tr style="background: rgba(0, 150, 57, 0.15); font-weight: 800; font-size: 1.1em;">
                <td colspan="5" style="padding: 12px 8px; border-bottom: 2px solid var(--primary); color: var(--text); text-align: left;">
                    Góndola: ${g.name}
                </td>
            </tr>`;

            g.config.shelves.forEach((s, sIdx) => {
                const shelfProducts = [];
                let shelfTotalUnits = 0;
                let shelfTotalValue = 0;

                s.products.forEach(p => {
                    let layersToProcess = p.layers;
                    if (!layersToProcess) {
                        if (p.productId) {
                            layersToProcess = [];
                            for(let i=0; i < (p.stacks || 1); i++) {
                                layersToProcess.push({ productId: p.productId, facings: p.facings, orientation: p.orientation || 0 });
                            }
                        } else {
                            return;
                        }
                    }

                    layersToProcess.forEach(layer => {
                        const product = state.getProductById(layer.productId);
                        if (!product) return;
                        
                        const dims = state.getPlacedDimensions(layer.productId, layer.orientation || 0);
                        const unitsInZ = Math.floor(g.config.shelfDepth / dims.depth);
                        const totalUnits = layer.facings * unitsInZ;
                        
                        let existing = shelfProducts.find(x => x.sku === product.sku);
                        if (!existing) {
                            existing = { sku: product.sku, name: product.name, units: 0, price: product.price, totalValue: 0 };
                            shelfProducts.push(existing);
                        }
                        existing.units += totalUnits;
                        existing.totalValue += (totalUnits * product.price);
                        
                        shelfTotalUnits += totalUnits;
                        shelfTotalValue += (totalUnits * product.price);
                        
                        gondolaTotalUnits += totalUnits;
                        gondolaTotalValue += (totalUnits * product.price);
                        
                        grandTotalUnits += totalUnits;
                        grandTotalValue += (totalUnits * product.price);
                        grandUniqueSkus.add(product.sku);
                    });
                });

                if (shelfProducts.length > 0) {
                    gondolaHasProducts = true;
                    const isPerchero = s.type === 'perchero';
                    const levelName = isPerchero ? `Nivel ${sIdx + 1} (Perchero)` : `Nivel ${sIdx + 1} (Plancha)`;
                    
                    gondolaHtml += `<tr style="background: var(--primary-light); font-weight: 700;">
                        <td colspan="5" style="padding: 8px; border-bottom: 1px solid var(--border); color: var(--primary); text-align: left;">
                            ${levelName}
                        </td>
                    </tr>`;
                    
                    shelfProducts.forEach(data => {
                        gondolaHtml += `<tr>
                            <td>${data.sku}</td>
                            <td>${data.name}</td>
                            <td>${data.units}</td>
                            <td>$${data.price.toFixed(2)}</td>
                            <td>$${data.totalValue.toFixed(2)}</td>
                        </tr>`;
                    });
                    
                    gondolaHtml += `<tr style="font-weight: 600; font-size: 0.9em; background: rgba(0,0,0,0.02);">
                        <td colspan="2" style="text-align: right; padding-right: 16px; color: var(--text-muted);">Subtotal ${levelName}:</td>
                        <td>${shelfTotalUnits}</td>
                        <td>-</td>
                        <td>$${shelfTotalValue.toFixed(2)}</td>
                    </tr>`;
                }
            });

            if (gondolaHasProducts) {
                gondolaHtml += `<tr style="font-weight: 700; background: rgba(0, 150, 57, 0.08);">
                    <td colspan="2" style="text-align: right; padding-right: 16px; color: var(--primary);">Total ${g.name}:</td>
                    <td>${gondolaTotalUnits}</td>
                    <td>-</td>
                    <td>$${gondolaTotalValue.toFixed(2)}</td>
                </tr>`;
                html += gondolaHtml;
            } else {
                html += gondolaHtml + `<tr><td colspan="5" style="text-align: center; padding: 10px; color: var(--text-muted);">Sin productos</td></tr>`;
            }
        });

        html += `<tr style="font-weight: bold; background: var(--primary); color: white; border-top: 2px solid var(--primary-hover);">
            <td colspan="2" style="text-align: right; padding-right: 16px;">TOTAL GLOBAL (${grandUniqueSkus.size} SKUs Únicos)</td>
            <td>${grandTotalUnits}</td>
            <td>-</td>
            <td>$${grandTotalValue.toFixed(2)}</td>
        </tr>`;

        html += '</tbody></table>';
        reportContent.innerHTML = html;
    }

    function generateInlineReport(store) {
        const section = document.getElementById('inline-report-section');
        const content = document.getElementById('inline-report-content');
        document.getElementById('inline-report-title').innerText = `Reporte: ${store.name}`;

        if (!store.library || store.library.length === 0) {
            content.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No hay góndolas en esta tienda para reportar.</p>';
            section.style.display = 'block';
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        let html = '<table class="report-table" id="inline-report-table" style="width: 100%; border-collapse: collapse;"><thead><tr style="background: var(--primary); color: white;"><th>SKU</th><th>Nombre</th><th>Cantidad</th><th>Precio Unit.</th><th>Valor Total</th></tr></thead><tbody>';
        
        let grandTotalUnits = 0;
        let grandTotalValue = 0;
        let grandUniqueSkus = new Set();

        store.library.forEach(g => {
            let gondolaHasProducts = false;
            let gondolaTotalUnits = 0;
            let gondolaTotalValue = 0;
            
            let gondolaHtml = `<tr style="background: rgba(0, 150, 57, 0.15); font-weight: 800; font-size: 1.1em;">
                <td colspan="5" style="padding: 12px 8px; border-bottom: 2px solid var(--primary); color: var(--text); text-align: left;">
                    Góndola: ${g.name}
                </td>
            </tr>`;

            g.config.shelves.forEach((s, sIdx) => {
                const shelfProducts = [];
                let shelfTotalUnits = 0;
                let shelfTotalValue = 0;

                s.products.forEach(p => {
                    let layersToProcess = p.layers;
                    if (!layersToProcess && p.productId) {
                        layersToProcess = [];
                        for (let i = 0; i < (p.stacks || 1); i++) {
                            layersToProcess.push({ productId: p.productId, facings: p.facings, orientation: p.orientation || 0 });
                        }
                    }
                    if (!layersToProcess) return;

                    layersToProcess.forEach(layer => {
                        const product = state.getProductById(layer.productId);
                        if (!product) return;
                        
                        const dims = state.getPlacedDimensions(layer.productId, layer.orientation || 0);
                        const unitsInZ = Math.floor(g.config.shelfDepth / dims.depth);
                        const totalUnits = layer.facings * unitsInZ;
                        
                        let existing = shelfProducts.find(x => x.sku === product.sku);
                        if (!existing) {
                            existing = { sku: product.sku, name: product.name, units: 0, price: product.price, totalValue: 0 };
                            shelfProducts.push(existing);
                        }
                        existing.units += totalUnits;
                        existing.totalValue += (totalUnits * product.price);
                        
                        shelfTotalUnits += totalUnits;
                        shelfTotalValue += (totalUnits * product.price);
                        
                        gondolaTotalUnits += totalUnits;
                        gondolaTotalValue += (totalUnits * product.price);
                        
                        grandTotalUnits += totalUnits;
                        grandTotalValue += (totalUnits * product.price);
                        grandUniqueSkus.add(product.sku);
                    });
                });

                if (shelfProducts.length > 0) {
                    gondolaHasProducts = true;
                    const isPerchero = s.type === 'perchero';
                    const levelName = isPerchero ? `Nivel ${sIdx + 1} (Perchero)` : `Nivel ${sIdx + 1} (Plancha)`;
                    
                    gondolaHtml += `<tr style="background: var(--primary-light); font-weight: 700;">
                        <td colspan="5" style="padding: 8px; border-bottom: 1px solid var(--border); color: var(--primary); text-align: left;">
                            ${levelName}
                        </td>
                    </tr>`;
                    
                    shelfProducts.forEach(data => {
                        gondolaHtml += `<tr><td>${data.sku}</td><td>${data.name}</td><td>${data.units}</td><td>$${data.price.toFixed(2)}</td><td>$${data.totalValue.toFixed(2)}</td></tr>`;
                    });
                    
                    gondolaHtml += `<tr style="font-weight: 600; font-size: 0.9em; background: rgba(0,0,0,0.02);">
                        <td colspan="2" style="text-align: right; padding-right: 16px; color: var(--text-muted);">Subtotal ${levelName}:</td>
                        <td>${shelfTotalUnits}</td>
                        <td>-</td>
                        <td>$${shelfTotalValue.toFixed(2)}</td>
                    </tr>`;
                }
            });

            if (gondolaHasProducts) {
                gondolaHtml += `<tr style="font-weight: 700; background: rgba(0, 150, 57, 0.08);">
                    <td colspan="2" style="text-align: right; padding-right: 16px; color: var(--primary);">Total ${g.name}:</td>
                    <td>${gondolaTotalUnits}</td>
                    <td>-</td>
                    <td>$${gondolaTotalValue.toFixed(2)}</td>
                </tr>`;
                html += gondolaHtml;
            } else {
                html += gondolaHtml + `<tr><td colspan="5" style="text-align: center; padding: 10px; color: var(--text-muted);">Sin productos</td></tr>`;
            }
        });

        html += `<tr style="font-weight: bold; background: var(--primary); color: white; border-top: 2px solid var(--primary-hover);">
            <td colspan="2" style="text-align: right; padding-right: 16px;">TOTAL GLOBAL (${grandUniqueSkus.size} SKUs)</td><td>${grandTotalUnits}</td><td>-</td><td>$${grandTotalValue.toFixed(2)}</td></tr>`;
        html += '</tbody></table>';
        content.innerHTML = html;
        section.style.display = 'block';

        setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }

    document.getElementById('btn-close-inline-report').addEventListener('click', () => {
        document.getElementById('inline-report-section').style.display = 'none';
    });

    document.getElementById('btn-inline-download-pdf').addEventListener('click', () => {
        const table = document.getElementById('inline-report-table');
        if (!table || typeof window.jspdf === 'undefined') { alert('No hay reporte para descargar o falta la librería PDF.'); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setFontSize(20);
        doc.text('Reporte Global - PlanogramPro', 40, 40);
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 40, 60);
        doc.autoTable({
            html: '#inline-report-table',
            startY: 80,
            theme: 'grid',
            headStyles: { fillColor: [0, 150, 57] },
            styles: { fontSize: 9 }
        });
        doc.save(`Reporte_Global_${Date.now()}.pdf`);
    });

    function generateReport() {
        const reportContent = document.getElementById('report-content');
        let html = '<table class="report-table" id="report-table" style="width: 100%; border-collapse: collapse;"><thead><tr style="background: var(--primary); color: white;"><th>SKU</th><th>Nombre</th><th>Cantidad</th><th>Precio Unit.</th><th>Valor Total</th></tr></thead><tbody>';
        
        let grandTotalUnits = 0;
        let grandTotalValue = 0;
        let grandUniqueSkus = new Set();

        state.gondola.shelves.forEach((s, sIdx) => {
            const shelfProducts = [];
            let shelfTotalUnits = 0;
            let shelfTotalValue = 0;

            s.products.forEach(p => {
                let layersToProcess = p.layers;
                if (!layersToProcess) {
                    if (p.productId) {
                        layersToProcess = [];
                        for(let i=0; i < (p.stacks || 1); i++) {
                            layersToProcess.push({ productId: p.productId, facings: p.facings, orientation: p.orientation || 0 });
                        }
                    } else {
                        return;
                    }
                }

                layersToProcess.forEach(layer => {
                    const product = state.getProductById(layer.productId);
                    if (!product) return;
                    
                    const dims = state.getPlacedDimensions(layer.productId, layer.orientation || 0);
                    const unitsInZ = Math.floor(state.gondola.shelfDepth / dims.depth);
                    const totalUnits = layer.facings * unitsInZ;
                    
                    let existing = shelfProducts.find(x => x.sku === product.sku);
                    if (!existing) {
                        existing = { sku: product.sku, name: product.name, units: 0, price: product.price, totalValue: 0 };
                        shelfProducts.push(existing);
                    }
                    
                    existing.units += totalUnits;
                    existing.totalValue += (totalUnits * product.price);
                    
                    shelfTotalUnits += totalUnits;
                    shelfTotalValue += (totalUnits * product.price);
                    
                    grandTotalUnits += totalUnits;
                    grandTotalValue += (totalUnits * product.price);
                    grandUniqueSkus.add(product.sku);
                });
            });

            if (shelfProducts.length > 0) {
                const isPerchero = s.type === 'perchero';
                const levelName = isPerchero ? `Nivel ${sIdx + 1} (Perchero)` : `Nivel ${sIdx + 1} (Plancha)`;
                
                html += `<tr style="background: var(--primary-light); font-weight: 700;">
                    <td colspan="5" style="padding: 8px; border-bottom: 1px solid var(--border); color: var(--primary); text-align: left;">
                        ${levelName}
                    </td>
                </tr>`;
                
                shelfProducts.forEach(data => {
                    html += `<tr>
                        <td>${data.sku}</td>
                        <td>${data.name}</td>
                        <td>${data.units}</td>
                        <td>$${data.price.toFixed(2)}</td>
                        <td>$${data.totalValue.toFixed(2)}</td>
                    </tr>`;
                });
                
                html += `<tr style="font-weight: 600; font-size: 0.9em; background: rgba(0,0,0,0.02);">
                    <td colspan="2" style="text-align: right; padding-right: 16px; color: var(--text-muted);">Subtotal ${levelName}:</td>
                    <td>${shelfTotalUnits}</td>
                    <td>-</td>
                    <td>$${shelfTotalValue.toFixed(2)}</td>
                </tr>`;
            }
        });

        if (grandTotalUnits === 0) {
             html += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay productos en esta góndola.</td></tr>`;
        }

        html += `<tr style="font-weight: bold; background: var(--primary); color: white; border-top: 2px solid var(--primary-hover);">
            <td colspan="2" style="text-align: right; padding-right: 16px;">TOTAL GLOBAL (${grandUniqueSkus.size} SKUs Únicos)</td>
            <td>${grandTotalUnits}</td>
            <td>-</td>
            <td>$${grandTotalValue.toFixed(2)}</td>
        </tr>`;

        html += '</tbody></table>';
        reportContent.innerHTML = html;
    }

    function generateGondola2DImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const g = state.gondola;
        
        // Helper to adjust color brightness
        function adjustColor(colorStr, amt) {
            let hex = String(colorStr).replace('#', '');
            if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            let num = parseInt(hex, 16);
            if (isNaN(num)) return colorStr;
            let r = (num >> 16) + amt;
            let gVal = ((num >> 8) & 0x00FF) + amt;
            let b = (num & 0x0000FF) + amt;
            r = Math.min(255, Math.max(0, r));
            gVal = Math.min(255, Math.max(0, gVal));
            b = Math.min(255, Math.max(0, b));
            return '#' + ((1 << 24) + (r << 16) + (gVal << 8) + b).toString(16).slice(1);
        }

        // Layout bounds
        const canvasW = 800;
        const gondolaX = 50; // left margin for height dimension
        const gondolaY = 60; // top margin for header/legend
        const availableW = canvasW - gondolaX - 40; // right margin
        const scale = availableW / g.width; // scale pixels per cm
        const gondolaH = g.height * scale;
        const canvasH = gondolaY + gondolaH + 60; // bottom margin for width dimension
        
        canvas.width = canvasW;
        canvas.height = canvasH;
        
        // Fill canvas background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);
        
        const activeGondola = state.library.find(p => p.id === state.currentGondolaId);
        const gondolaName = activeGondola ? activeGondola.name : 'Góndola';

        // 1. Draw Title
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px "Outfit", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`VISTA FRONTAL TÉCNICA: ${gondolaName.toUpperCase()}`, gondolaX, 15);
        
        ctx.fillStyle = '#64748b';
        ctx.font = 'normal 9px Inter, sans-serif';
        ctx.fillText(`Tipo: ${(g.type || 'Pared').toUpperCase()} | Profundidad: ${g.shelfDepth || 0}cm`, gondolaX, 32);

        // 2. Draw metallic uprights (postes laterales)
        const uprightL = ctx.createLinearGradient(gondolaX - 12, 0, gondolaX, 0);
        uprightL.addColorStop(0, '#94a3b8');
        uprightL.addColorStop(0.4, '#f1f5f9');
        uprightL.addColorStop(1, '#64748b');
        ctx.fillStyle = uprightL;
        ctx.fillRect(gondolaX - 12, gondolaY, 12, gondolaH);
        
        const uprightR = ctx.createLinearGradient(gondolaX + availableW, 0, gondolaX + availableW + 12, 0);
        uprightR.addColorStop(0, '#64748b');
        uprightR.addColorStop(0.4, '#f1f5f9');
        uprightR.addColorStop(1, '#94a3b8');
        ctx.fillStyle = uprightR;
        ctx.fillRect(gondolaX + availableW, gondolaY, 12, gondolaH);

        // 3. Draw gondola backboard
        const typeColors = {
            pared: '#f8fafc',
            central: '#ffffff',
            cabecera: '#fdfdfd',
            refrigerado: '#f0f9ff'
        };
        ctx.fillStyle = typeColors[g.type] || '#f8fafc';
        ctx.fillRect(gondolaX, gondolaY, availableW, gondolaH);
        
        // If refrigeration, draw standard blue glass shelf frames
        if (g.type === 'refrigerado') {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
            ctx.fillRect(gondolaX, gondolaY, availableW, gondolaH);
        }

        // Draw pegboard panel backboard
        g.shelves.forEach((s, sIdx) => {
            if (s.type === 'perchero') {
                const usableH = state.getShelfUsableHeight(sIdx);
                const sYCanvas = gondolaY + gondolaH - (s.y * scale);
                const pegboardH = usableH * scale;
                const pegboardY = sYCanvas - pegboardH;
                
                ctx.fillStyle = '#f1f5f9';
                ctx.fillRect(gondolaX, pegboardY, availableW, pegboardH);
                
                // Pegboard hole pattern
                ctx.fillStyle = '#cbd5e1';
                for (let x = gondolaX + 8; x < gondolaX + availableW; x += 16) {
                    for (let y = pegboardY + 8; y < pegboardY + pegboardH; y += 16) {
                        ctx.beginPath();
                        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        });
        
        // 4. Draw placed products (with premium gloss and detail)
        g.shelves.forEach((s, sIdx) => {
            const isPerchero = s.type === 'perchero';
            const sYCanvas = gondolaY + gondolaH - (s.y * scale);
            const shelfThicknessPx = (isPerchero ? 1 : g.shelfThickness) * scale;
            
            s.products.forEach(p => {
                let layersToProcess = p.layers || [];
                let currentY = 0;
                
                layersToProcess.forEach((layer, lIdx) => {
                    const product = state.getProductById(layer.productId);
                    if (!product) return;
                    
                    const dims = state.getPlacedDimensions(layer.productId, layer.orientation || 0);
                    const pWidthPx = dims.width * scale * layer.facings;
                    const pHeightPx = dims.height * scale;
                    const pXPx = gondolaX + (p.x * scale);
                    
                    // Placement height adjustment
                    const baseOffset = isPerchero ? (dims.height * 0.15) * scale : shelfThicknessPx;
                    const pYPx = sYCanvas - baseOffset - (currentY * scale) - pHeightPx;
                    
                    // Draw each facing with its gloss gradient
                    const singleWidthPx = dims.width * scale;
                    for (let f = 0; f < layer.facings; f++) {
                        const faceXPx = pXPx + f * singleWidthPx;
                        
                        // Glossy vertical gradient
                        const grad = ctx.createLinearGradient(faceXPx, pYPx, faceXPx, pYPx + pHeightPx);
                        const baseCol = product.color || '#3b82f6';
                        grad.addColorStop(0, adjustColor(baseCol, 40));
                        grad.addColorStop(0.25, baseCol);
                        grad.addColorStop(0.85, adjustColor(baseCol, -15));
                        grad.addColorStop(1, adjustColor(baseCol, -30));
                        
                        ctx.fillStyle = grad;
                        ctx.fillRect(faceXPx, pYPx, singleWidthPx, pHeightPx);
                        
                        // Thin dark border for the product container
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(faceXPx, pYPx, singleWidthPx, pHeightPx);
                        
                        // Premium inner glow effect (light reflection)
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(faceXPx + 1, pYPx + 1, singleWidthPx - 2, pHeightPx - 2);
                        
                        // Top Cap/Lid design (to make it look like actual shampoo/medicine/beverage bottle)
                        if (singleWidthPx > 8 && pHeightPx > 20) {
                            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                            ctx.fillRect(faceXPx + 2, pYPx, singleWidthPx - 4, 3);
                        }
                    }
                    
                    // Draw SKU label centered on the total block
                    if (pWidthPx > 22 && pHeightPx > 10) {
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 8px "Outfit", sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        // High-contrast text outline
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
                        ctx.lineWidth = 3;
                        ctx.strokeText(product.sku, pXPx + pWidthPx / 2, pYPx + pHeightPx / 2);
                        ctx.fillText(product.sku, pXPx + pWidthPx / 2, pYPx + pHeightPx / 2);
                    }
                    
                    currentY += dims.height;
                });
            });
        });
        
        // 5. Draw shelf plates (planchas) with bevel 3D look
        g.shelves.forEach((s, sIdx) => {
            const isPerchero = s.type === 'perchero';
            const sYCanvas = gondolaY + gondolaH - (s.y * scale);
            const shelfThicknessPx = (isPerchero ? 1 : g.shelfThickness) * scale;
            
            if (isPerchero) {
                // Perchero bar
                ctx.fillStyle = '#475569';
                ctx.fillRect(gondolaX, sYCanvas - shelfThicknessPx, availableW, shelfThicknessPx);
            } else {
                // Premium steel gradient for plancha shelf
                const shelfGrad = ctx.createLinearGradient(0, sYCanvas - shelfThicknessPx, 0, sYCanvas);
                shelfGrad.addColorStop(0, '#e2e8f0'); // bright steel top
                shelfGrad.addColorStop(0.3, '#94a3b8');
                shelfGrad.addColorStop(0.7, '#475569');
                shelfGrad.addColorStop(1, '#334155'); // dark bottom shadow
                
                ctx.fillStyle = shelfGrad;
                ctx.fillRect(gondolaX, sYCanvas - shelfThicknessPx, availableW, shelfThicknessPx);
                
                // Colorful price tag label strip (porta-precios)
                ctx.fillStyle = '#009639'; // Clean Locatel green price tag holder strip!
                ctx.fillRect(gondolaX, sYCanvas - Math.max(3, shelfThicknessPx * 0.4), availableW, Math.max(2, shelfThicknessPx * 0.35));
                
                // Small metallic brackets on the left/right corners
                ctx.fillStyle = '#64748b';
                ctx.fillRect(gondolaX - 2, sYCanvas - shelfThicknessPx, 2, shelfThicknessPx + 2);
                ctx.fillRect(gondolaX + availableW, sYCanvas - shelfThicknessPx, 2, shelfThicknessPx + 2);
            }
            
            // Shelf index label in white bold text inside the shelf
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(isPerchero ? `PERCHERO N${sIdx+1}` : `PLANCHA N${sIdx+1}`, gondolaX + 8, sYCanvas - shelfThicknessPx/2);
        });

        // 6. Draw professional Dimension Lines (Líneas de Cota)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#475569';
        
        // A. Width Dimension Line (Bottom)
        const dimY = canvasH - 30;
        ctx.beginPath();
        // Main line
        ctx.moveTo(gondolaX, dimY);
        ctx.lineTo(gondolaX + availableW, dimY);
        // Extension lines
        ctx.moveTo(gondolaX, dimY - 10);
        ctx.lineTo(gondolaX, dimY + 5);
        ctx.moveTo(gondolaX + availableW, dimY - 10);
        ctx.lineTo(gondolaX + availableW, dimY + 5);
        ctx.stroke();
        
        // Draw arrows
        drawArrow(ctx, gondolaX, dimY, 5, 'left');
        drawArrow(ctx, gondolaX + availableW, dimY, 5, 'right');
        
        // Center text label
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textLabel = `${g.width} cm`;
        const textWidth = ctx.measureText(textLabel).width + 10;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gondolaX + availableW/2 - textWidth/2, dimY - 8, textWidth, 16);
        ctx.fillStyle = '#1e293b';
        ctx.fillText(textLabel, gondolaX + availableW/2, dimY);

        // B. Height Dimension Line (Left side)
        const dimX = 20;
        ctx.beginPath();
        ctx.moveTo(dimX, gondolaY);
        ctx.lineTo(dimX, gondolaY + gondolaH);
        // Extension lines
        ctx.moveTo(dimX - 5, gondolaY);
        ctx.lineTo(dimX + 10, gondolaY);
        ctx.moveTo(dimX - 5, gondolaY + gondolaH);
        ctx.lineTo(dimX + 10, gondolaY + gondolaH);
        ctx.stroke();
        
        // Draw height arrows
        drawArrow(ctx, dimX, gondolaY, 5, 'up');
        drawArrow(ctx, dimX, gondolaY + gondolaH, 5, 'down');
        
        // Rotated vertical height label
        ctx.save();
        ctx.translate(dimX + 8, gondolaY + gondolaH/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillStyle = '#ffffff';
        const heightLabel = `${g.height} cm`;
        const hTextW = ctx.measureText(heightLabel).width + 8;
        ctx.fillRect(-hTextW/2, -8, hTextW, 16);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(heightLabel, 0, 0);
        ctx.restore();

        // 7. Outer board border
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvasW, canvasH);
        
        return canvas.toDataURL('image/jpeg', 0.95);
    }

    // Arrow drawing helper
    function drawArrow(ctx, x, y, size, dir) {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        if (dir === 'left') {
            ctx.moveTo(x, y);
            ctx.lineTo(x + size * 1.5, y - size);
            ctx.lineTo(x + size * 1.5, y + size);
        } else if (dir === 'right') {
            ctx.moveTo(x, y);
            ctx.lineTo(x - size * 1.5, y - size);
            ctx.lineTo(x - size * 1.5, y + size);
        } else if (dir === 'up') {
            ctx.moveTo(x, y);
            ctx.lineTo(x - size, y + size * 1.5);
            ctx.lineTo(x + size, y + size * 1.5);
        } else if (dir === 'down') {
            ctx.moveTo(x, y);
            ctx.lineTo(x - size, y - size * 1.5);
            ctx.lineTo(x + size, y - size * 1.5);
        }
        ctx.closePath();
        ctx.fill();
    }

    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        
        const activeGondola = state.library.find(p => p.id === state.currentGondolaId);
        const gondolaName = activeGondola ? activeGondola.name : 'Góndola';
        
        // Page 1 Header - Compact & Elegant Corporate Design to maximize schematic size
        doc.setFontSize(22);
        doc.setTextColor(0, 150, 57); // Locatel Green
        doc.text('REPORTE DE PLANOGRAMA', 40, 45);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Mueble: ${gondolaName} (${(state.gondola.type || 'Pared').toUpperCase()}) | Dim: ${state.gondola.width || 0}x${state.gondola.height || 0}x${state.gondola.shelfDepth || 0} cm | Fecha: ${new Date().toLocaleString()}`, 40, 62);
        
        // Add 2D Planogram Image
        const planogramImgData = generateGondola2DImage();
        
        // Calculate rendering width and height in points
        // A4 page height is 842 pt, top margin is 75 pt, bottom margin is 40 pt -> leaves ~727 pt vertical space!
        const displayW = 515; // 595 - 40 * 2 margin
        const displayH = ((state.gondola.height || 100) / (state.gondola.width || 100)) * displayW;
        
        // Let's allow the image to use up to 700 pt of page height!
        const maxImageH = 700;
        let finalW = displayW;
        let finalH = displayH;
        if (displayH > maxImageH) {
            finalH = maxImageH;
            finalW = ((state.gondola.width || 100) / (state.gondola.height || 100)) * finalH;
        }
        
        // Centered position inside the remaining area
        const imgX = 40 + (displayW - finalW) / 2;
        const imgY = 80; // Start immediately after the header text!
        doc.addImage(planogramImgData, 'JPEG', imgX, imgY, finalW, finalH);
        
        // Add Page 2 for Detailed Table
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(0, 150, 57);
        doc.text('DETALLE DE INVENTARIO Y CAPACIDAD', 40, 40);
        
        doc.autoTable({
            html: '#report-table',
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [0, 150, 57] },
            styles: { fontSize: 9 }
        });
        
        doc.save(`Reporte_Planograma_${gondolaName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    }

    let currentModalTarget = null;

    function openProductModal(product, layer, shelfIdx, pIdx, unitsInZ, dims, lIdx) {
        currentModalTarget = { shelfIdx, pIdx, lIdx };
        document.getElementById('modal-product-name').innerText = product.name;
        document.getElementById('modal-product-y').innerText = "Capa " + (lIdx + 1);
        document.getElementById('modal-product-z').innerText = unitsInZ;
        
        const inputFacings = document.getElementById('input-modal-facings');
        if (inputFacings) {
            inputFacings.value = layer.facings;
        }
        
        document.getElementById('product-details-modal').style.display = 'grid';
    }

    document.getElementById('close-product-modal').addEventListener('click', () => {
        document.getElementById('product-details-modal').style.display = 'none';
        currentModalTarget = null;
    });

    document.getElementById('btn-modal-rotate-product').addEventListener('click', () => {
        if (currentModalTarget) {
            const result = state.rotateProduct(currentModalTarget.shelfIdx, currentModalTarget.pIdx, currentModalTarget.lIdx);
            if (!result.success) alert(result.reason || 'No se puede rotar.');
            document.getElementById('product-details-modal').style.display = 'none';
            currentModalTarget = null;
        }
    });

    document.getElementById('btn-modal-delete-product').addEventListener('click', () => {
        if (currentModalTarget) {
            state.removeFromShelf(currentModalTarget.shelfIdx, currentModalTarget.pIdx, currentModalTarget.lIdx);
            document.getElementById('product-details-modal').style.display = 'none';
            currentModalTarget = null;
        }
    });

    // Stepper facings controls
    const updateModalFacings = (newVal) => {
        if (!currentModalTarget) return;
        const input = document.getElementById('input-modal-facings');
        const val = Math.max(1, parseInt(newVal) || 1);
        const result = state.updateProductFacings(currentModalTarget.shelfIdx, currentModalTarget.pIdx, currentModalTarget.lIdx, val);
        if (!result.success) {
            alert(result.reason || 'No hay espacio suficiente.');
            if (input) {
                const shelf = state.gondola.shelves[currentModalTarget.shelfIdx];
                const p = shelf.products[currentModalTarget.pIdx];
                const layer = p.layers[currentModalTarget.lIdx];
                input.value = layer.facings;
            }
        } else {
            if (input) input.value = val;
        }
    };

    const decBtn = document.getElementById('btn-modal-dec-facings');
    const incBtn = document.getElementById('btn-modal-inc-facings');
    const facingsInput = document.getElementById('input-modal-facings');

    if (decBtn) {
        decBtn.addEventListener('click', () => {
            if (facingsInput) {
                const currentVal = parseInt(facingsInput.value) || 1;
                updateModalFacings(currentVal - 1);
            }
        });
    }

    if (incBtn) {
        incBtn.addEventListener('click', () => {
            if (facingsInput) {
                const currentVal = parseInt(facingsInput.value) || 1;
                updateModalFacings(currentVal + 1);
            }
        });
    }

    if (facingsInput) {
        facingsInput.addEventListener('change', (e) => {
            updateModalFacings(e.target.value);
        });
    }

    // Close modal if clicked outside the card
    document.getElementById('product-details-modal').addEventListener('click', (e) => {
        if (e.target.id === 'product-details-modal') {
            document.getElementById('product-details-modal').style.display = 'none';
            currentModalTarget = null;
        }
    });

    init();
});
