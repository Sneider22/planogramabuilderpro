/* ============================================
   STATE.JS - Estado Global con Librería de Mobiliario
   ============================================ */

class AppState {
    constructor() {
        this._listeners = {};

        // Stores Logic
        try {
            this.stores = JSON.parse(localStorage.getItem('planogram_stores')) || [];
            if (!Array.isArray(this.stores)) this.stores = [];
        } catch (e) {
            this.stores = [];
        }
        this.currentStoreId = null;
        this.currentGondolaId = null;

        // Configuración Actual (Actúa como el mueble seleccionado)
        this.gondola = this._getDefaultGondola();

        // Catálogo de Productos Extendido (SAP Mock) - Enfoque Locatel Farmacia y Bienestar
        this.products = [
            // Farmacia
            { id: 'P001', sku: 'SAP-FAR01', name: 'Paracetamol 500mg (10 Tab)', width: 10, height: 6, depth: 2, price: 1.20, color: '#3b82f6', category: 'Farmacia' },
            { id: 'P002', sku: 'SAP-FAR02', name: 'Ibuprofeno 400mg (10 Tab)', width: 11, height: 7, depth: 2, price: 1.80, color: '#ef4444', category: 'Farmacia' },
            { id: 'P003', sku: 'SAP-FAR03', name: 'Jarabe Antigripal 120ml', width: 6, height: 14, depth: 6, price: 4.50, color: '#10b981', category: 'Farmacia' },
            { id: 'P004', sku: 'SAP-FAR04', name: 'Alcohol Antiséptico 70% 500ml', width: 8, height: 18, depth: 8, price: 2.10, color: '#06b6d4', category: 'Farmacia' },
            { id: 'P005', sku: 'SAP-FAR05', name: 'Curitas Band-Aid (Caja 30)', width: 8, height: 12, depth: 3, price: 1.50, color: '#f59e0b', category: 'Farmacia' },
            { id: 'P006', sku: 'SAP-FAR06', name: 'Venda Elástica 10cm x 5m', width: 7, height: 7, depth: 7, price: 3.20, color: '#d97706', category: 'Farmacia' },

            // Cuidado Personal
            { id: 'P007', sku: 'SAP-CUI01', name: 'Champú Herbal Locatel 400ml', width: 7, height: 21, depth: 5, price: 5.40, color: '#047857', category: 'Cuidado Personal' },
            { id: 'P008', sku: 'SAP-CUI02', name: 'Acondicionador Brillo 400ml', width: 7, height: 21, depth: 5, price: 5.60, color: '#10b981', category: 'Cuidado Personal' },
            { id: 'P009', sku: 'SAP-CUI03', name: 'Crema Dental Triple Acción', width: 18, height: 4, depth: 4, price: 2.30, color: '#dc2626', category: 'Cuidado Personal' },
            { id: 'P010', sku: 'SAP-CUI04', name: 'Enjuague Bucal Menta 500ml', width: 9, height: 22, depth: 6, price: 6.90, color: '#0ea5e9', category: 'Cuidado Personal' },
            { id: 'P011', sku: 'SAP-CUI05', name: 'Desodorante Invisible Roll-on', width: 5, height: 11, depth: 5, price: 3.50, color: '#64748b', category: 'Cuidado Personal' },
            { id: 'P012', sku: 'SAP-CUI06', name: 'Crema Corporal Dermacare 200ml', width: 8, height: 16, depth: 4, price: 8.90, color: '#f1f5f9', category: 'Cuidado Personal' },

            // Nutrición & Suplementos
            { id: 'P013', sku: 'SAP-NUT01', name: 'Vitamina C Efervescente 1000mg', width: 4, height: 14, depth: 4, price: 6.50, color: '#f97316', category: 'Nutrición & Suplementos' },
            { id: 'P014', sku: 'SAP-NUT02', name: 'Omega 3 Premium (60 Cáps)', width: 6, height: 12, depth: 6, price: 14.90, color: '#eab308', category: 'Nutrición & Suplementos' },
            { id: 'P015', sku: 'SAP-NUT03', name: 'Calcio + Vitamina D (90 Tab)', width: 7, height: 13, depth: 7, price: 12.50, color: '#cbd5e1', category: 'Nutrición & Suplementos' },
            { id: 'P016', sku: 'SAP-NUT04', name: 'Complejo B Forte (30 Cáps)', width: 5, height: 10, depth: 5, price: 9.80, color: '#991b1b', category: 'Nutrición & Suplementos' },
            { id: 'P017', sku: 'SAP-NUT05', name: 'Proteína Whey Fit 500g', width: 14, height: 22, depth: 14, price: 29.90, color: '#111827', category: 'Nutrición & Suplementos' },

            // Mamá & Bebé
            { id: 'P018', sku: 'SAP-BEB01', name: 'Pañales Bebé Confort (Talla G)', width: 22, height: 26, depth: 12, price: 18.50, color: '#a5f3fc', category: 'Mamá & Bebé' },
            { id: 'P019', sku: 'SAP-BEB02', name: 'Toallitas Húmedas Sin Alcohol', width: 18, height: 5, depth: 10, price: 2.80, color: '#ecfeff', category: 'Mamá & Bebé' },
            { id: 'P020', sku: 'SAP-BEB03', name: 'Crema Antipañalitis Óxido Zinc', width: 14, height: 4, depth: 4, price: 4.90, color: '#fbcfe8', category: 'Mamá & Bebé' },
            { id: 'P021', sku: 'SAP-BEB04', name: 'Fórmula Infantil Etapa 1 400g', width: 10, height: 12, depth: 10, price: 11.20, color: '#fef08a', category: 'Mamá & Bebé' },

            // Bebidas & Snacks
            { id: 'P022', sku: 'SAP-ALM01', name: 'Barra de Proteína Avena & Miel', width: 14, height: 4, depth: 2, price: 1.50, color: '#d97706', category: 'Bebidas & Snacks' },
            { id: 'P023', sku: 'SAP-ALM02', name: 'Bebida Isotónica Hidratante', width: 7, height: 22, depth: 7, price: 2.20, color: '#3b82f6', category: 'Bebidas & Snacks' },
            { id: 'P024', sku: 'SAP-ALM03', name: 'Agua de Coco 100% Organica', width: 6, height: 15, depth: 6, price: 3.10, color: '#22c55e', category: 'Bebidas & Snacks' },
            { id: 'P025', sku: 'SAP-ALM04', name: 'Té Verde Matcha Orgánico', width: 8, height: 12, depth: 5, price: 5.90, color: '#86efac', category: 'Bebidas & Snacks' },
        ];

        // Librería de Presets (Depende de la tienda seleccionada)
        this.library = [];

        this._nextProductId = 10;
        this._buildShelves();
    }

    _getDefaultGondola() {
        return {
            type: 'pared', // pared, central, cabecera, refrigerado
            width: 100,
            height: 210,
            depth: 40,
            numShelves: 5,
            gapBetweenShelves: 35,
            baseHeight: 20,
            shelfThickness: 2,
            shelfDepth: 40,
            shelfWidth: 100,
            shelves: []
        };
    }

    // --- Store Management ---
    createStore(name) {
        const newStore = {
            id: 'store-' + Date.now(),
            name: name,
            createdAt: Date.now(),
            library: []
        };
        this.stores.push(newStore);
        this._saveStores();
        return newStore;
    }

    selectStore(id) {
        this.currentStoreId = id;
        this.currentGondolaId = null;
        const store = this.stores.find(s => s.id === id);
        if (store) {
            this.library = store.library || [];
            this.emit('store:selected', store);
            this.emit('library:updated', this.library);
        }
    }

    _saveStores() {
        localStorage.setItem('planogram_stores', JSON.stringify(this.stores));
    }

    // --- Gondola Persistence (Auto-save) ---
    createNewGondola(name = 'Nueva Góndola') {
        if (!this.currentStoreId) return;
        const newId = 'gondola-' + Date.now();
        const newGondolaData = {
            id: newId,
            name: name,
            config: this._getDefaultGondola()
        };
        
        this.library.push(newGondolaData);
        this.currentGondolaId = newId;
        this.gondola = JSON.parse(JSON.stringify(newGondolaData.config));
        this._buildShelves();
        
        const store = this.stores.find(s => s.id === this.currentStoreId);
        if (store) {
            store.library = this.library;
            this._saveStores();
        }
        
        this.emit('library:updated', this.library);
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return newId;
    }

    loadGondola(id) {
        const preset = this.library.find(p => p.id === id);
        if (preset) {
            this.currentGondolaId = id;
            this.gondola = JSON.parse(JSON.stringify(preset.config));
            this._buildShelves();
            this.emit('gondola:updated', this.gondola);
            this.emit('dashboard:update');
        }
    }

    duplicateGondola() {
        if (!this.currentStoreId || !this.currentGondolaId) return;
        const currentData = this.library.find(p => p.id === this.currentGondolaId);
        if (!currentData) return;
        
        const newId = 'gondola-' + Date.now();
        const newGondolaData = {
            id: newId,
            name: currentData.name + ' (Copia)',
            config: JSON.parse(JSON.stringify(this.gondola))
        };
        
        this.library.push(newGondolaData);
        this.currentGondolaId = newId;
        
        const store = this.stores.find(s => s.id === this.currentStoreId);
        if (store) {
            store.library = this.library;
            this._saveStores();
        }
        
        this.emit('library:updated', this.library);
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
    }

    deleteGondola(id) {
        if (!this.currentStoreId) return;
        this.library = this.library.filter(p => p.id !== id);
        
        const store = this.stores.find(s => s.id === this.currentStoreId);
        if (store) {
            store.library = this.library;
            this._saveStores();
        }
        
        this.emit('library:updated', this.library);
    }

    _autoSave() {
        if (!this.currentStoreId || !this.currentGondolaId) return;
        const preset = this.library.find(p => p.id === this.currentGondolaId);
        if (preset) {
            preset.config = JSON.parse(JSON.stringify(this.gondola));
            const store = this.stores.find(s => s.id === this.currentStoreId);
            if (store) {
                store.library = this.library;
                this._saveStores();
            }
        }
    }

    // --- Gondola Logic ---
    updateGondola(updates) {
        Object.assign(this.gondola, updates);
        if (updates.width !== undefined) this.gondola.shelfWidth = updates.width;
        if (updates.depth !== undefined) this.gondola.shelfDepth = updates.depth;
        
        this._buildShelves();
        this._autoSave();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
    }

    setShelfType(shelfIndex, type) {
        if (this.gondola.shelves && this.gondola.shelves[shelfIndex]) {
            this.gondola.shelves[shelfIndex].type = type;
            this._recalculateShelfX(shelfIndex);
            this._autoSave();
            this.emit('gondola:updated', this.gondola);
            this.emit('dashboard:update');
        }
    }

    setShelfHookSpacing(shelfIndex, spacing) {
        if (this.gondola.shelves && this.gondola.shelves[shelfIndex]) {
            this.gondola.shelves[shelfIndex].hookSpacing = parseFloat(spacing) || 15;
            this._recalculateShelfX(shelfIndex);
            this._autoSave();
            this.emit('gondola:updated', this.gondola);
            this.emit('dashboard:update');
        }
    }

    _buildShelves() {
        const g = this.gondola;
        const oldShelves = g.shelves || [];
        g.shelves = [];

        for (let i = 0; i < g.numShelves; i++) {
            const yPos = g.baseHeight + i * (g.gapBetweenShelves + g.shelfThickness);
            const oldShelf = oldShelves[i];
            g.shelves.push({
                id: `shelf-${i}`,
                index: i,
                y: yPos,
                type: oldShelf ? (oldShelf.type || 'plancha') : 'plancha',
                hookSpacing: oldShelf ? (oldShelf.hookSpacing || 15) : 15,
                products: oldShelf ? oldShelf.products : []
            });
        }
    }

    // --- Helpers ---
    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    }

    emit(event, data) {
        (this._listeners[event] || []).forEach(cb => cb(data));
    }

    getProductById(id) { return this.products.find(p => p.id === id); }

    getPlacedDimensions(productId, orientation = 0) {
        const prod = this.getProductById(productId);
        if (!prod) return { width: 0, height: 0, depth: 0 };
        
        let w = prod.width, h = prod.height, d = prod.depth;
        switch(orientation) {
            case 1: return { width: h, height: w, depth: d }; // side (xy)
            case 2: return { width: d, height: h, depth: w }; // depth-facing (xz)
            case 3: return { width: d, height: w, depth: h }; // depth-facing side
            case 4: return { width: w, height: d, depth: h }; // top-facing (yz)
            case 5: return { width: h, height: d, depth: w }; // top-facing side
            default: return { width: w, height: h, depth: d }; // normal
        }
    }

    getShelfUsableHeight(shelfIndex) {
        const g = this.gondola;
        const shelf = g.shelves[shelfIndex];
        if (!shelf) return 0;
        const nextShelf = g.shelves[shelfIndex + 1];
        const ceiling = nextShelf ? nextShelf.y : g.height;
        return ceiling - (shelf.y + g.shelfThickness);
    }

    getShelfUsedWidth(shelfIndex) {
        const shelf = this.gondola.shelves[shelfIndex];
        if (!shelf) return 0;
        return shelf.products.reduce((sum, p) => {
            if (!p.layers && p.productId) {
                const dims = this.getPlacedDimensions(p.productId, p.orientation || 0);
                return sum + (dims.width * (p.facings || 1));
            }
            if (!p.layers || p.layers.length === 0) return sum;
            const baseLayer = p.layers[0];
            const dims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
            return sum + (dims.width * baseLayer.facings);
        }, 0);
    }

    getShelfAvailableWidth(shelfIndex) {
        return this.gondola.shelfWidth - this.getShelfUsedWidth(shelfIndex);
    }

    getPlacementBoundingBox(shelfIndex, placement) {
        const shelf = this.gondola.shelves[shelfIndex];
        const g = this.gondola;
        
        let w = 0;
        let h = 0;

        if (placement.layers && placement.layers.length > 0) {
            const baseLayer = placement.layers[0];
            const baseDims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
            w = baseDims.width * baseLayer.facings;

            placement.layers.forEach(layer => {
                const layerDims = this.getPlacedDimensions(layer.productId, layer.orientation || 0);
                h += layerDims.height;
            });
        } else if (!placement.layers && placement.productId) {
            const dims = this.getPlacedDimensions(placement.productId, placement.orientation || 0);
            w = dims.width * (placement.facings || 1);
            h = dims.height;
        }

        let yBottom = 0;
        let yTop = 0;

        if (shelf.type === 'perchero') {
            yBottom = shelf.y - h * 0.85;
            yTop = shelf.y + h * 0.15;
        } else {
            yBottom = shelf.y + g.shelfThickness;
            yTop = yBottom + h;
        }

        return {
            x1: placement.x,
            x2: placement.x + w,
            y1: yBottom,
            y2: yTop,
            width: w,
            height: h
        };
    }

    checkGlobalCollisions() {
        const g = this.gondola;
        const placements = [];

        g.shelves.forEach(shelf => {
            shelf.products.forEach(p => {
                const box = this.getPlacementBoundingBox(shelf.index, p);
                placements.push({
                    shelfIndex: shelf.index,
                    productName: this._getProductName(p),
                    box: box
                });
            });
        });

        for (let i = 0; i < placements.length; i++) {
            for (let j = i + 1; j < placements.length; j++) {
                const pA = placements[i];
                const pB = placements[j];

                if (pA.shelfIndex === pB.shelfIndex) continue;

                const bA = pA.box;
                const bB = pB.box;

                const xOverlap = (bA.x1 < bB.x2 && bA.x2 > bB.x1);
                const yOverlap = (bA.y1 < bB.y2 && bA.y2 > bB.y1);

                if (xOverlap && yOverlap) {
                    return {
                        valid: false,
                        reason: `Choque de estantería: El producto colgante "${pA.productName}" (Nivel ${pA.shelfIndex + 1}) colisiona verticalmente con el producto "${pB.productName}" (Nivel ${pB.shelfIndex + 1}) de abajo debido a su longitud de suspensión.`
                    };
                }
            }
        }

        return { valid: true };
    }

    _getProductName(p) {
        let productId = p.productId;
        if (p.layers && p.layers.length > 0) {
            productId = p.layers[0].productId;
        }
        const prod = this.getProductById(productId);
        return prod ? prod.name : 'Producto';
    }

    checkHookSpacingOverlap(shelfIndex, proposedSpacing) {
        const shelf = this.gondola.shelves[shelfIndex];
        if (!shelf || shelf.type !== 'perchero') return { valid: true };

        const originalSpacing = shelf.hookSpacing || 15;
        const originalProducts = JSON.parse(JSON.stringify(shelf.products));

        const spacing = proposedSpacing;
        const numHooks = Math.floor(this.gondola.shelfWidth / spacing);
        const margin = (this.gondola.shelfWidth - (numHooks - 1) * spacing) / 2;
        const shelfWidth = this.gondola.shelfWidth;

        if (shelf.products.length > numHooks) {
            return {
                valid: false,
                reason: `No hay suficientes ganchos disponibles con ${spacing}cm de separación.\nSe necesitan ${shelf.products.length} ganchos, pero con esta separación solo caben ${numHooks}.`
            };
        }

        // Apply temporary spacing & positions
        shelf.hookSpacing = spacing;
        this._recalculateShelfX(shelfIndex);

        for (let i = 0; i < shelf.products.length; i++) {
            const p1 = shelf.products[i];

            let w1 = 0;
            if (p1.layers && p1.layers.length > 0) {
                const baseLayer = p1.layers[0];
                const dims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
                w1 = dims.width * baseLayer.facings;
            } else if (!p1.layers && p1.productId) {
                const dims = this.getPlacedDimensions(p1.productId, p1.orientation || 0);
                w1 = dims.width * (p1.facings || 1);
            }

            const hookX = margin + i * spacing;
            const leftEdge = hookX - w1 / 2;
            const rightEdge = hookX + w1 / 2;

            if (leftEdge < 0) {
                shelf.hookSpacing = originalSpacing;
                shelf.products = originalProducts;
                this._recalculateShelfX(shelfIndex);
                return {
                    valid: false,
                    reason: `Colisión de borde: El producto en el Gancho ${i+1} (${w1}cm de ancho) sobresaldría ${Math.abs(leftEdge).toFixed(1)}cm por el lateral izquierdo de la góndola.`
                };
            }
            if (rightEdge > shelfWidth) {
                shelf.hookSpacing = originalSpacing;
                shelf.products = originalProducts;
                this._recalculateShelfX(shelfIndex);
                return {
                    valid: false,
                    reason: `Colisión de borde: El producto en el Gancho ${i+1} (${w1}cm de ancho) sobresaldría ${(rightEdge - shelfWidth).toFixed(1)}cm por el lateral derecho de la góndola.`
                };
            }

            if (i < shelf.products.length - 1) {
                const p2 = shelf.products[i+1];
                let w2 = 0;
                if (p2.layers && p2.layers.length > 0) {
                    const baseLayer = p2.layers[0];
                    const dims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
                    w2 = dims.width * baseLayer.facings;
                } else if (!p2.layers && p2.productId) {
                    const dims = this.getPlacedDimensions(p2.productId, p2.orientation || 0);
                    w2 = dims.width * (p2.facings || 1);
                }

                const hookX2 = margin + (i + 1) * spacing;
                const rightEdge1 = hookX + w1 / 2;
                const leftEdge2 = hookX2 - w2 / 2;

                if (rightEdge1 > leftEdge2) {
                    shelf.hookSpacing = originalSpacing;
                    shelf.products = originalProducts;
                    this._recalculateShelfX(shelfIndex);
                    return {
                        valid: false,
                        reason: `Colisión de productos: El producto en el Gancho ${i+1} (${w1}cm) choca con el producto del Gancho ${i+2} (${w2}cm) si reduces la distancia a ${spacing}cm.`
                    };
                }
            }
        }

        // Global vertical collision check
        const globalCheck = this.checkGlobalCollisions();
        if (!globalCheck.valid) {
            shelf.hookSpacing = originalSpacing;
            shelf.products = originalProducts;
            this._recalculateShelfX(shelfIndex);
            return {
                valid: false,
                reason: globalCheck.reason
            };
        }

        // Revert temporary spacing
        shelf.hookSpacing = originalSpacing;
        shelf.products = originalProducts;
        this._recalculateShelfX(shelfIndex);

        return { valid: true };
    }

    _recalculateShelfX(shelfIndex) {
        const shelf = this.gondola.shelves[shelfIndex];
        if (!shelf) return;
        
        const isPerchero = shelf.type === 'perchero';
        
        if (isPerchero) {
            // Static hook spacing: dynamic per shelf level!
            const spacing = shelf.hookSpacing || 15;
            const numHooks = Math.floor(this.gondola.shelfWidth / spacing);
            const margin = (this.gondola.shelfWidth - (numHooks - 1) * spacing) / 2;
            
            shelf.products.forEach((p, idx) => {
                if (p.hookIndex === undefined) {
                    const occupied = shelf.products
                        .filter(other => other !== p && other.hookIndex !== undefined)
                        .map(other => other.hookIndex);
                    
                    let found = 0;
                    for (let i = 0; i < numHooks; i++) {
                        if (!occupied.includes(i)) {
                            found = i;
                            break;
                        }
                    }
                    p.hookIndex = found;
                }

                const hookX = margin + p.hookIndex * spacing;
                
                if (p.layers && p.layers.length > 0) {
                    const baseLayer = p.layers[0];
                    const dims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
                    p.x = hookX - (dims.width * baseLayer.facings) / 2;
                } else if (!p.layers && p.productId) {
                    const dims = this.getPlacedDimensions(p.productId, p.orientation || 0);
                    p.x = hookX - (dims.width * (p.facings || 1)) / 2;
                } else {
                    p.x = hookX;
                }
            });
        } else {
            // Standard left-to-right pack
            let currentX = 0;
            shelf.products.forEach(p => {
                p.x = currentX;
                if (!p.layers && p.productId) {
                    const dims = this.getPlacedDimensions(p.productId, p.orientation || 0);
                    currentX += dims.width * (p.facings || 1);
                } else if (p.layers && p.layers.length > 0) {
                    const baseLayer = p.layers[0];
                    const dims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
                    currentX += dims.width * baseLayer.facings;
                }
            });
        }
    }

    placeProduct(shelfIndex, productId, facings = 1, targetHookIndex = undefined) {
        const shelf = this.gondola.shelves[shelfIndex];
        if (!shelf) return { success: false, reason: 'Error interno' };

        const dims = this.getPlacedDimensions(productId, 0);
        if (dims.width === 0) return { success: false, reason: 'Producto no encontrado' };

        const requiredWidth = dims.width * facings;
        const availableWidth = this.getShelfAvailableWidth(shelfIndex);
        const usableHeight = this.getShelfUsableHeight(shelfIndex);

        if (shelf.type === 'perchero') {
            const spacing = shelf.hookSpacing || 15;
            const numHooks = Math.floor(this.gondola.shelfWidth / spacing);
            const margin = (this.gondola.shelfWidth - (numHooks - 1) * spacing) / 2;
            
            // 1. Capacity limit check
            if (shelf.products.length >= numHooks) {
                return { 
                    success: false, 
                    reason: `No quedan ganchos libres en este perchero. \nMáximo: ${numHooks} ganchos.` 
                };
            }

            // Determine target hook index
            let targetIdx = targetHookIndex;
            const occupied = shelf.products
                .filter(other => other.hookIndex !== undefined)
                .map(other => other.hookIndex);

            if (targetIdx === undefined) {
                let found = -1;
                for (let i = 0; i < numHooks; i++) {
                    if (!occupied.includes(i)) {
                        found = i;
                        break;
                    }
                }
                if (found === -1) return { success: false, reason: `No quedan ganchos libres.` };
                targetIdx = found;
            } else {
                if (occupied.includes(targetIdx)) {
                    return { success: false, reason: `El Gancho ${targetIdx + 1} ya está ocupado.` };
                }
            }

            const nextHookX = margin + targetIdx * spacing;
            const newWidth = dims.width * facings;

            // 2. Physical boundary checks (so products don't hang off the sides!)
            const newLeftEdge = nextHookX - newWidth / 2;
            const newRightEdge = nextHookX + newWidth / 2;

            if (newLeftEdge < 0) {
                return {
                    success: false,
                    reason: `Colisión de borde: El producto es muy ancho (${newWidth}cm) para este gancho y sobresaldría ${Math.abs(newLeftEdge).toFixed(1)}cm por el lateral izquierdo de la góndola.`
                };
            }
            if (newRightEdge > this.gondola.shelfWidth) {
                return {
                    success: false,
                    reason: `Colisión de borde: El producto es muy ancho (${newWidth}cm) para este gancho y sobresaldría ${(newRightEdge - this.gondola.shelfWidth).toFixed(1)}cm por el lateral derecho de la góndola.`
                };
            }

            // 3. Physical collision check with adjacent products
            for (let i = 0; i < shelf.products.length; i++) {
                const other = shelf.products[i];
                let otherWidth = 0;
                if (other.layers && other.layers.length > 0) {
                    otherWidth = this.getPlacedDimensions(other.layers[0].productId, other.layers[0].orientation || 0).width * other.layers[0].facings;
                } else {
                    otherWidth = this.getPlacedDimensions(other.productId, other.orientation || 0).width * (other.facings || 1);
                }

                const otherHookX = margin + other.hookIndex * spacing;
                const otherLeft = otherHookX - otherWidth / 2;
                const otherRight = otherHookX + otherWidth / 2;

                if (newLeftEdge < otherRight && newRightEdge > otherLeft) {
                    return {
                        success: false,
                        reason: `Colisión física: El producto es muy ancho (${newWidth}cm) y choca con el producto del Gancho ${other.hookIndex + 1}.`
                    };
                }
            }

            const originalProducts = JSON.parse(JSON.stringify(shelf.products));
            shelf.products.push({
                x: 0,
                hookIndex: targetIdx,
                placedAt: Date.now(),
                layers: [{
                    productId: productId,
                    facings: facings,
                    orientation: 0
                }]
            });

            this._recalculateShelfX(shelfIndex);

            const globalCheck = this.checkGlobalCollisions();
            if (!globalCheck.valid) {
                shelf.products = originalProducts;
                this._recalculateShelfX(shelfIndex);
                return { success: false, reason: globalCheck.reason };
            }

            this._autoSave();
            this.emit('gondola:updated', this.gondola);
            this.emit('dashboard:update');
            return { success: true };

        } else {
            if (availableWidth < requiredWidth) {
                return { 
                    success: false, 
                    reason: `Sin espacio lineal. \nRequerido: ${requiredWidth}cm \nDisponible: ${availableWidth.toFixed(1)}cm` 
                };
            }
        }

        if (dims.height > usableHeight) {
            return { 
                success: false, 
                reason: `Producto muy alto. \nAltura: ${dims.height}cm \nEspacio libre: ${usableHeight.toFixed(1)}cm` 
            };
        }

        const originalProducts = JSON.parse(JSON.stringify(shelf.products));

        shelf.products.push({
            x: 0, // Will be set correctly by recalculate
            placedAt: Date.now(),
            layers: [{
                productId: productId,
                facings: facings,
                orientation: 0
            }]
        });

        this._recalculateShelfX(shelfIndex);

        // Dry-run check for global vertical collisions!
        const globalCheck = this.checkGlobalCollisions();
        if (!globalCheck.valid) {
            // Revert
            shelf.products = originalProducts;
            this._recalculateShelfX(shelfIndex);
            return {
                success: false,
                reason: globalCheck.reason
            };
        }

        this._autoSave();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return { success: true };
    }

    moveProduct(sourceShelfIndex, sourcePlacementIndex, targetShelfIndex, targetHookIndex = undefined, sourceLayerIndex = undefined) {
        const sourceShelf = this.gondola.shelves[sourceShelfIndex];
        const targetShelf = this.gondola.shelves[targetShelfIndex];
        if (!sourceShelf || !targetShelf) return { success: false, reason: 'Error de estantes' };

        const placement = sourceShelf.products[sourcePlacementIndex];
        if (!placement) return { success: false, reason: 'Producto no encontrado' };

        const originalSourceProducts = JSON.parse(JSON.stringify(sourceShelf.products));
        const originalTargetProducts = JSON.parse(JSON.stringify(targetShelf.products));

        // Get single layer
        let singleLayerToMove = null;
        if (sourceLayerIndex !== undefined && placement.layers && placement.layers.length > 1) {
            singleLayerToMove = placement.layers[sourceLayerIndex];
        }

        let productId = placement.productId;
        let facings = placement.facings || 1;
        let orientation = placement.orientation || 0;
        if (singleLayerToMove) {
            productId = singleLayerToMove.productId;
            facings = singleLayerToMove.facings || 1;
            orientation = singleLayerToMove.orientation || 0;
        } else if (placement.layers && placement.layers.length > 0) {
            productId = placement.layers[0].productId;
            facings = placement.layers[0].facings;
            orientation = placement.layers[0].orientation || 0;
        }

        const dims = this.getPlacedDimensions(productId, orientation);

        if (targetShelf.type === 'perchero') {
            const spacing = targetShelf.hookSpacing || 15;
            const numHooks = Math.floor(this.gondola.shelfWidth / spacing);
            const margin = (this.gondola.shelfWidth - (numHooks - 1) * spacing) / 2;

            let targetIdx = targetHookIndex;
            const willRemoveSourcePlacement = !singleLayerToMove || (placement.layers && placement.layers.length <= 1);

            const occupied = targetShelf.products
                .filter((p, i) => {
                    if (sourceShelfIndex === targetShelfIndex && i === sourcePlacementIndex) {
                        return !willRemoveSourcePlacement;
                    }
                    return true;
                })
                .map(p => p.hookIndex);

            if (targetIdx === undefined) {
                let found = -1;
                for (let i = 0; i < numHooks; i++) {
                    if (!occupied.includes(i)) {
                        found = i;
                        break;
                    }
                }
                if (found === -1) {
                    return { success: false, reason: `No quedan ganchos libres en este perchero.` };
                }
                targetIdx = found;
            } else {
                if (occupied.includes(targetIdx)) {
                    return { success: false, reason: `El Gancho ${targetIdx + 1} ya está ocupado.` };
                }
            }

            const hookX = margin + targetIdx * spacing;
            const newWidth = dims.width * facings;

            // Boundary checks
            const newLeftEdge = hookX - newWidth / 2;
            const newRightEdge = hookX + newWidth / 2;

            if (newLeftEdge < 0) {
                return { success: false, reason: `Colisión de borde: El producto es muy ancho (${newWidth}cm) y sobresaldría ${Math.abs(newLeftEdge).toFixed(1)}cm por la izquierda.` };
            }
            if (newRightEdge > this.gondola.shelfWidth) {
                return { success: false, reason: `Colisión de borde: El producto es muy ancho (${newWidth}cm) y sobresaldría ${(newRightEdge - this.gondola.shelfWidth).toFixed(1)}cm por la derecha.` };
            }

            // Check adjacent collisions
            for (let i = 0; i < targetShelf.products.length; i++) {
                if (sourceShelfIndex === targetShelfIndex && i === sourcePlacementIndex) {
                    if (willRemoveSourcePlacement) continue;
                }
                const other = targetShelf.products[i];
                let otherWidth = 0;
                if (other.layers && other.layers.length > 0) {
                    otherWidth = this.getPlacedDimensions(other.layers[0].productId, other.layers[0].orientation || 0).width * other.layers[0].facings;
                } else {
                    otherWidth = this.getPlacedDimensions(other.productId, other.orientation || 0).width * (other.facings || 1);
                }

                const otherHookX = margin + other.hookIndex * spacing;
                const otherLeft = otherHookX - otherWidth / 2;
                const otherRight = otherHookX + otherWidth / 2;

                if (newLeftEdge < otherRight && newRightEdge > otherLeft) {
                    return { success: false, reason: `Colisión física: El producto choca físicamente con el producto del Gancho ${other.hookIndex + 1}.` };
                }
            }

            if (singleLayerToMove) {
                placement.layers.splice(sourceLayerIndex, 1);
                if (placement.layers.length === 0) {
                    sourceShelf.products.splice(sourcePlacementIndex, 1);
                }
                targetShelf.products.push({
                    x: 0,
                    hookIndex: targetIdx,
                    placedAt: Date.now(),
                    layers: [singleLayerToMove]
                });
            } else {
                sourceShelf.products.splice(sourcePlacementIndex, 1);
                placement.hookIndex = targetIdx;
                targetShelf.products.push(placement);
            }

        } else {
            const requiredWidth = dims.width * facings;
            let usedWidth = 0;
            const willRemoveSourcePlacement = !singleLayerToMove || (placement.layers && placement.layers.length <= 1);

            targetShelf.products.forEach((other, idx) => {
                if (sourceShelfIndex === targetShelfIndex && idx === sourcePlacementIndex) {
                    if (willRemoveSourcePlacement) return;
                }
                if (other.layers && other.layers.length > 0) {
                    usedWidth += this.getPlacedDimensions(other.layers[0].productId, other.layers[0].orientation || 0).width * other.layers[0].facings;
                } else {
                    usedWidth += this.getPlacedDimensions(other.productId, other.orientation || 0).width * (other.facings || 1);
                }
            });
            const available = this.gondola.shelfWidth - usedWidth;
            if (requiredWidth > available) {
                return { success: false, reason: `Sin espacio lineal suficiente en la plancha destino.` };
            }

            if (singleLayerToMove) {
                placement.layers.splice(sourceLayerIndex, 1);
                if (placement.layers.length === 0) {
                    sourceShelf.products.splice(sourcePlacementIndex, 1);
                }
                targetShelf.products.push({
                    x: 0,
                    placedAt: Date.now(),
                    layers: [singleLayerToMove]
                });
            } else {
                sourceShelf.products.splice(sourcePlacementIndex, 1);
                delete placement.hookIndex; 
                targetShelf.products.push(placement);
            }
        }

        this._recalculateShelfX(sourceShelfIndex);
        this._recalculateShelfX(targetShelfIndex);

        // Global collision check
        const globalCheck = this.checkGlobalCollisions();
        if (!globalCheck.valid) {
            sourceShelf.products = originalSourceProducts;
            targetShelf.products = originalTargetProducts;
            this._recalculateShelfX(sourceShelfIndex);
            this._recalculateShelfX(targetShelfIndex);
            return { success: false, reason: globalCheck.reason };
        }

        this._autoSave();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return { success: true };
    }

    stackProduct(shelfIndex, placementIndex, newProductId) {
        const shelf = this.gondola.shelves[shelfIndex];
        const p = shelf.products[placementIndex];
        if (!p || !p.layers || p.layers.length === 0) return { success: false, reason: 'Pila inválida' };

        // 1. Calculate total width of base layer
        const baseLayer = p.layers[0];
        const baseDims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
        const baseTotalWidth = baseDims.width * baseLayer.facings;

        // 2. Calculate dimensions of new product
        const newDims = this.getPlacedDimensions(newProductId, 0);
        if (newDims.width === 0) return { success: false, reason: 'Producto no encontrado' };

        // 3. Determine how many facings of new product fit in baseTotalWidth
        const newFacings = Math.floor(baseTotalWidth / newDims.width);

        if (newFacings < 1) {
            return {
                success: false,
                reason: `El producto es muy ancho para apilarse aquí. \nAncho disponible: ${baseTotalWidth.toFixed(1)}cm \nAncho producto: ${newDims.width}cm`
            };
        }

        // 4. Check total stack height against shelf usable height
        const usableHeight = this.getShelfUsableHeight(shelfIndex);
        let currentStackHeight = 0;
        p.layers.forEach(layer => {
            const layerDims = this.getPlacedDimensions(layer.productId, layer.orientation || 0);
            currentStackHeight += layerDims.height;
        });

        const nextStackHeight = currentStackHeight + newDims.height;

        if (nextStackHeight > usableHeight) {
            return { 
                success: false, 
                reason: `Sin espacio vertical. \nAltura proyectada: ${nextStackHeight}cm \nEspacio libre: ${usableHeight.toFixed(1)}cm` 
            };
        }

        // 5. Add new layer temporarily
        const originalLayers = [...p.layers];
        p.layers.push({
            productId: newProductId,
            facings: newFacings,
            orientation: 0
        });

        // Dry-run check for global vertical collisions!
        const globalCheck = this.checkGlobalCollisions();
        if (!globalCheck.valid) {
            // Revert
            p.layers = originalLayers;
            return {
                success: false,
                reason: globalCheck.reason
            };
        }

        this._autoSave();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return { success: true };
    }

    removeFromShelf(sIdx, pIdx, lIdx = undefined) {
        const p = this.gondola.shelves[sIdx].products[pIdx];
        if (!p || !p.layers) return;

        if (lIdx === undefined || lIdx === 0) {
            // Remove whole placement if base layer is deleted or no layer specified
            this.gondola.shelves[sIdx].products.splice(pIdx, 1);
        } else {
            // Remove specific layer
            p.layers.splice(lIdx, 1);
        }

        this._recalculateShelfX(sIdx);
        this._autoSave();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
    }

    rotateProduct(sIdx, pIdx, lIdx) {
        const p = this.gondola.shelves[sIdx].products[pIdx];
        if (!p || !p.layers) return { success: false };
        const layer = p.layers[lIdx];
        if (!layer) return { success: false };
        
        const originalOrientation = layer.orientation || 0;
        const originalProducts = JSON.parse(JSON.stringify(this.gondola.shelves[sIdx].products));

        layer.orientation = ((layer.orientation || 0) + 1) % 6;
        
        if (lIdx > 0) {
            const baseLayer = p.layers[0];
            const baseDims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
            const baseTotalWidth = baseDims.width * baseLayer.facings;
            
            const newDims = this.getPlacedDimensions(layer.productId, layer.orientation);
            const newFacings = Math.floor(baseTotalWidth / newDims.width);
            
            if (newFacings < 1) {
                 layer.orientation = originalOrientation;
                 return { success: false, reason: 'La rotación hace que la capa exceda el ancho de la base.' };
            }
            layer.facings = newFacings;
        } else {
            this._recalculateShelfX(sIdx);
        }

        // Dry-run collision & boundary check!
        const shelf = this.gondola.shelves[sIdx];
        if (shelf.type === 'perchero') {
            const check = this.checkHookSpacingOverlap(sIdx, shelf.hookSpacing || 15);
            if (!check.valid) {
                this.gondola.shelves[sIdx].products = originalProducts;
                this._recalculateShelfX(sIdx);
                return { success: false, reason: check.reason };
            }
        } else {
            const usableHeight = this.getShelfUsableHeight(sIdx);
            let totalHeight = 0;
            p.layers.forEach(l => {
                const dims = this.getPlacedDimensions(l.productId, l.orientation || 0);
                totalHeight += dims.height;
            });
            if (totalHeight > usableHeight) {
                this.gondola.shelves[sIdx].products = originalProducts;
                this._recalculateShelfX(sIdx);
                return { success: false, reason: `La rotación hace que el producto sea muy alto (${totalHeight}cm) para el espacio libre (${usableHeight.toFixed(1)}cm).` };
            }
            const totalUsedWidth = this.getShelfUsedWidth(sIdx);
            if (totalUsedWidth > this.gondola.shelfWidth) {
                this.gondola.shelves[sIdx].products = originalProducts;
                this._recalculateShelfX(sIdx);
                return { success: false, reason: `La rotación hace que el producto sea muy ancho y no quepa en el estante.` };
            }
        }

        const globalCheck = this.checkGlobalCollisions();
        if (!globalCheck.valid) {
            this.gondola.shelves[sIdx].products = originalProducts;
            this._recalculateShelfX(sIdx);
            return { success: false, reason: globalCheck.reason };
        }
        
        this._autoSave();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return { success: true };
    }

    updateProductFacings(sIdx, pIdx, lIdx, newFacings) {
        const shelf = this.gondola.shelves[sIdx];
        if (!shelf) return { success: false, reason: 'Estante no encontrado' };
        const p = shelf.products[pIdx];
        if (!p || !p.layers) return { success: false, reason: 'Producto no encontrado' };
        const layer = p.layers[lIdx];
        if (!layer) return { success: false, reason: 'Capa no encontrada' };

        const originalProducts = JSON.parse(JSON.stringify(shelf.products));

        const dims = this.getPlacedDimensions(layer.productId, layer.orientation || 0);
        
        const oldWidth = dims.width * layer.facings;
        const newWidth = dims.width * newFacings;
        const diff = newWidth - oldWidth;

        const available = this.getShelfAvailableWidth(sIdx);
        if (diff > available) {
            return {
                success: false,
                reason: `Sin espacio lineal suficiente. \nDisponible: ${available.toFixed(1)}cm \nRequerido adicional: ${diff.toFixed(1)}cm`
            };
        }

        layer.facings = newFacings;
        
        if (lIdx === 0) {
            for (let i = 1; i < p.layers.length; i++) {
                const uLayer = p.layers[i];
                const uDims = this.getPlacedDimensions(uLayer.productId, uLayer.orientation || 0);
                const maxF = Math.floor(newWidth / uDims.width);
                uLayer.facings = Math.max(1, maxF);
            }
        }

        this._recalculateShelfX(sIdx);

        // Dry-run check for global collisions & adjacent / boundary limits!
        if (shelf.type === 'perchero') {
            const check = this.checkHookSpacingOverlap(sIdx, shelf.hookSpacing || 15);
            if (!check.valid) {
                shelf.products = originalProducts;
                this._recalculateShelfX(sIdx);
                return { success: false, reason: check.reason };
            }
        }

        const globalCheck = this.checkGlobalCollisions();
        if (!globalCheck.valid) {
            shelf.products = originalProducts;
            this._recalculateShelfX(sIdx);
            return { success: false, reason: globalCheck.reason };
        }

        this._autoSave();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return { success: true };
    }
}
