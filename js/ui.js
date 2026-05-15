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

    function init() {
        renderGondola();
        renderCatalog();
        renderLibrary();
        updateDashboard();
        setupEventListeners();
    }

    function renderGondola() {
        const g = state.gondola;
        const scale = 3;

        gondola3d.style.width = `${g.width * scale}px`;
        gondola3d.style.height = `${g.height * scale}px`;
        gondola3d.innerHTML = '';

        // Back Panel (Visual difference based on type)
        const backPanel = document.createElement('div');
        backPanel.className = 'gondola-back-panel';
        backPanel.style.width = '100%';
        backPanel.style.height = '100%';
        
        if (g.type === 'refrigerado') {
            backPanel.style.border = '10px solid #475569';
            backPanel.style.background = '#020617';
        } else if (g.type === 'central') {
            backPanel.style.background = '#334155';
            backPanel.style.borderRight = '2px solid rgba(255,255,255,0.1)';
        }
        
        gondola3d.appendChild(backPanel);

        g.shelves.forEach((shelf, idx) => {
            const shelfEl = document.createElement('div');
            shelfEl.className = 'shelf-3d';
            shelfEl.style.width = `${g.width * scale}px`;
            shelfEl.style.height = `${g.shelfThickness * scale}px`;
            shelfEl.style.bottom = `${shelf.y * scale}px`;
            shelfEl.style.left = '0px';
            shelfEl.style.transform = `translateZ(0px)`;

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
            top.style.height = `${g.shelfDepth * scale}px`;
            shelfEl.appendChild(top);

            const front = document.createElement('div');
            front.className = 'shelf-front';
            front.style.transform = `translateZ(${g.shelfDepth * scale}px)`;
            shelfEl.appendChild(front);

            shelf.products.forEach((p, pIdx) => {
                const product = state.getProductById(p.productId);
                if (!product) return;

                const unitsInZ = Math.floor(g.shelfDepth / product.depth);
                const visualDepth = unitsInZ * product.depth * scale;
                
                const prodEl = document.createElement('div');
                prodEl.className = 'placed-product';
                prodEl.style.width = `${product.width * scale * p.facings}px`;
                prodEl.style.height = `${product.height * scale * p.stacks}px`;
                prodEl.style.left = `${p.x * scale}px`;
                prodEl.style.bottom = `${g.shelfThickness * scale}px`;
                // Push the origin of the box back so it sits inside the shelf, 
                // and its front aligns with the shelf edge
                prodEl.style.transform = `translateZ(${g.shelfDepth * scale - visualDepth}px)`;

                const depthBadge = document.createElement('div');
                depthBadge.className = 'z-depth-badge';
                depthBadge.innerHTML = `
                    <div>${unitsInZ} Z | ${p.stacks} Y</div>
                    <button class="btn-delete-product" title="Quitar producto">&times;</button>
                `;
                // Make the badge appear in front of the product's front face
                depthBadge.style.setProperty('--badge-z', `${visualDepth + 10}px`);
                
                depthBadge.querySelector('.btn-delete-product').addEventListener('click', (e) => {
                    e.stopPropagation();
                    state.removeFromShelf(idx, pIdx);
                });
                
                prodEl.appendChild(depthBadge);

                const box = document.createElement('div');
                box.className = 'product-box';
                // box.style.backgroundColor is no longer needed since we apply background to faces
                
                const unitW = product.width * scale;
                const unitH = product.height * scale;
                const unitD = product.depth * scale;
                const gridBg = `linear-gradient(to right, rgba(0,0,0,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.25) 1px, transparent 1px)`;

                const faceFront = document.createElement('div');
                faceFront.className = 'face face-front';
                faceFront.style.background = `${gridBg}, ${product.color}`;
                faceFront.style.backgroundSize = `${unitW}px ${unitH}px`;
                // Move the front face forward to cap the box
                faceFront.style.transform = `translateZ(${visualDepth}px)`;
                faceFront.innerHTML = `${p.facings > 1 ? p.facings + 'X' : ''}`;
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

                prodEl.appendChild(box);

                prodEl.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); prodEl.style.boxShadow = '0 0 15px gold'; });
                prodEl.addEventListener('dragleave', () => { prodEl.style.boxShadow = 'none'; });
                prodEl.addEventListener('drop', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const productId = e.dataTransfer.getData('text/plain');
                    if (productId === p.productId) {
                        const result = state.stackProduct(idx, pIdx);
                        if (!result.success) alert(result.reason);
                    }
                });

                prodEl.addEventListener('dblclick', (e) => { e.stopPropagation(); state.removeFromShelf(idx, pIdx); });
                shelfEl.appendChild(prodEl);
            });

            gondola3d.appendChild(shelfEl);
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
                const val = (key === 'type') ? e.target.value : parseFloat(e.target.value);
                const updates = {};
                if (key === 'gap') updates.gapBetweenShelves = val;
                else updates[key] = val;
                
                if (dimPreset && ['width', 'height', 'depth'].includes(key)) {
                    dimPreset.value = 'custom';
                }
                state.updateGondola(updates);
            });
        });

        // Save Preset
        document.getElementById('btn-save-preset').addEventListener('click', () => {
            const name = prompt('Nombre del Preset:', `Mueble_${state.gondola.type}_${Date.now().toString().slice(-4)}`);
            if (name) state.savePreset(name);
        });

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
        state.on('library:updated', renderLibrary);
        state.on('dashboard:update', updateDashboard);
    }

    function generateReport() {
        const reportContent = document.getElementById('report-content');
        let html = '<table class="report-table" id="report-table"><thead><tr><th>SKU</th><th>Nombre</th><th>Cantidad</th><th>Precio Unit.</th><th>Valor Total</th></tr></thead><tbody>';
        state.gondola.shelves.forEach(s => {
            s.products.forEach(p => {
                const product = state.getProductById(p.productId);
                const unitsInZ = Math.floor(state.gondola.shelfDepth / product.depth);
                const totalUnits = p.facings * p.stacks * unitsInZ;
                html += `<tr>
                    <td>${product.sku}</td>
                    <td>${product.name}</td>
                    <td>${totalUnits}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>$${(totalUnits * product.price).toFixed(2)}</td>
                </tr>`;
            });
        });
        html += '</tbody></table>';
        reportContent.innerHTML = html;
    }

    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setFontSize(20);
        doc.text('Reporte de Planograma - PlanogramPro', 40, 40);
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 40, 60);
        doc.text(`Mueble: ${state.gondola.type.toUpperCase()} | ${state.gondola.width}x${state.gondola.height}cm`, 40, 75);
        doc.autoTable({
            html: '#report-table',
            startY: 100,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] },
            styles: { fontSize: 9 }
        });
        doc.save(`Reporte_Planograma_${Date.now()}.pdf`);
    }

    init();
});
