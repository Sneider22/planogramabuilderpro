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

        // Catálogo de Productos Extendido (SAP Mock)
        this.products = [
            // Lácteos
            { id: 'P001', sku: 'SAP-001', name: 'Leche Entera 1L', width: 7, height: 20, depth: 7, price: 1.50, color: '#3b82f6', category: 'Lácteos' },
            { id: 'P002', sku: 'SAP-002', name: 'Yogur Fresa 250g', width: 6, height: 10, depth: 6, price: 0.95, color: '#ec4899', category: 'Lácteos' },
            { id: 'P003', sku: 'SAP-003', name: 'Queso Crema 200g', width: 10, height: 5, depth: 10, price: 2.80, color: '#f1f5f9', category: 'Lácteos' },
            
            // Snacks
            { id: 'P004', sku: 'SAP-004', name: 'Papas Fritas XL', width: 20, height: 30, depth: 8, price: 3.50, color: '#eab308', category: 'Snacks' },
            { id: 'P005', sku: 'SAP-005', name: 'Galletas María', width: 18, height: 6, depth: 6, price: 1.20, color: '#f97316', category: 'Snacks' },
            { id: 'P006', sku: 'SAP-006', name: 'Mix de Maní 150g', width: 12, height: 15, depth: 4, price: 2.10, color: '#d97706', category: 'Snacks' },
            
            // Limpieza
            { id: 'P007', sku: 'SAP-007', name: 'Detergente Líquido', width: 15, height: 28, depth: 10, price: 8.50, color: '#10b981', category: 'Limpieza' },
            { id: 'P008', sku: 'SAP-008', name: 'Limpiavidrios 500ml', width: 9, height: 22, depth: 6, price: 4.20, color: '#06b6d4', category: 'Limpieza' },
            { id: 'P009', sku: 'SAP-009', name: 'Cloro Concentrado', width: 10, height: 25, depth: 10, price: 2.90, color: '#ffffff', category: 'Limpieza' },
            
            // Despensa
            { id: 'P010', sku: 'SAP-010', name: 'Arroz Extra 1kg', width: 12, height: 18, depth: 4, price: 0.90, color: '#94a3b8', category: 'Despensa' },
            { id: 'P011', sku: 'SAP-011', name: 'Pasta Penne 500g', width: 10, height: 20, depth: 5, price: 1.10, color: '#ef4444', category: 'Despensa' },
            { id: 'P012', sku: 'SAP-012', name: 'Harina Trigo 1kg', width: 10, height: 15, depth: 8, price: 1.30, color: '#cbd5e1', category: 'Despensa' },
            { id: 'P013', sku: 'SAP-013', name: 'Café Molido 250g', width: 8, height: 15, depth: 5, price: 4.80, color: '#451a03', category: 'Despensa' },

            // Bebidas
            { id: 'P014', sku: 'SAP-014', name: 'Refresco Cola 2L', width: 10, height: 35, depth: 10, price: 2.50, color: '#7f1d1d', category: 'Bebidas' },
            { id: 'P015', sku: 'SAP-015', name: 'Jugo Naranja 1L', width: 8, height: 22, depth: 8, price: 1.80, color: '#f97316', category: 'Bebidas' },
            { id: 'P016', sku: 'SAP-016', name: 'Agua Mineral 500ml', width: 6, height: 20, depth: 6, price: 0.50, color: '#bae6fd', category: 'Bebidas' },
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

    _recalculateShelfX(shelfIndex) {
        const shelf = this.gondola.shelves[shelfIndex];
        if (!shelf) return;
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

    placeProduct(shelfIndex, productId, facings = 1) {
        const shelf = this.gondola.shelves[shelfIndex];
        if (!shelf) return { success: false, reason: 'Error interno' };

        const dims = this.getPlacedDimensions(productId, 0);
        if (dims.width === 0) return { success: false, reason: 'Producto no encontrado' };

        const requiredWidth = dims.width * facings;
        const availableWidth = this.getShelfAvailableWidth(shelfIndex);
        const usableHeight = this.getShelfUsableHeight(shelfIndex);

        if (availableWidth < requiredWidth) {
            return { 
                success: false, 
                reason: `Sin espacio lineal. \nRequerido: ${requiredWidth}cm \nDisponible: ${availableWidth.toFixed(1)}cm` 
            };
        }

        if (dims.height > usableHeight) {
            return { 
                success: false, 
                reason: `Producto muy alto. \nAltura: ${dims.height}cm \nEspacio libre: ${usableHeight.toFixed(1)}cm` 
            };
        }

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

        // 5. Add new layer
        p.layers.push({
            productId: newProductId,
            facings: newFacings,
            orientation: 0
        });

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
        
        layer.orientation = ((layer.orientation || 0) + 1) % 6;
        
        if (lIdx > 0) {
            const baseLayer = p.layers[0];
            const baseDims = this.getPlacedDimensions(baseLayer.productId, baseLayer.orientation || 0);
            const baseTotalWidth = baseDims.width * baseLayer.facings;
            
            const newDims = this.getPlacedDimensions(layer.productId, layer.orientation);
            const newFacings = Math.floor(baseTotalWidth / newDims.width);
            
            if (newFacings < 1) {
                 layer.orientation = (layer.orientation + 5) % 6;
                 return { success: false, reason: 'La rotación hace que la capa exceda el ancho de la base.' };
            }
            layer.facings = newFacings;
        } else {
            this._recalculateShelfX(sIdx);
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
        this._autoSave();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return { success: true };
    }
}
