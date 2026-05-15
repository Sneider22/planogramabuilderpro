/* ============================================
   STATE.JS - Estado Global con Librería de Mobiliario
   ============================================ */

class AppState {
    constructor() {
        this._listeners = {};

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

        // Librería de Presets
        this.library = JSON.parse(localStorage.getItem('plano_library')) || [
            { id: 'preset-1', name: 'Góndola Pared Estándar', config: this._getDefaultGondola() }
        ];

        this._nextProductId = 10;
        this._buildShelves();
    }

    _getDefaultGondola() {
        return {
            type: 'pared', // pared, central, cabecera, refrigerado
            width: 120,
            height: 200,
            depth: 48,
            numShelves: 4,
            gapBetweenShelves: 40,
            baseHeight: 12,
            shelfThickness: 2,
            shelfDepth: 48,
            shelfWidth: 120,
            shelves: []
        };
    }

    // --- Persistence ---
    savePreset(name) {
        const id = 'preset-' + Date.now();
        const newPreset = {
            id: id,
            name: name,
            config: JSON.parse(JSON.stringify(this.gondola))
        };
        this.library.push(newPreset);
        localStorage.setItem('plano_library', JSON.stringify(this.library));
        this.emit('library:updated', this.library);
    }

    loadPreset(id) {
        const preset = this.library.find(p => p.id === id);
        if (preset) {
            this.gondola = JSON.parse(JSON.stringify(preset.config));
            this._buildShelves();
            this.emit('gondola:updated', this.gondola);
            this.emit('dashboard:update');
        }
    }

    deletePreset(id) {
        this.library = this.library.filter(p => p.id !== id);
        localStorage.setItem('plano_library', JSON.stringify(this.library));
        this.emit('library:updated', this.library);
    }

    // --- Gondola Logic ---
    updateGondola(updates) {
        Object.assign(this.gondola, updates);
        
        // Si cambia el tipo, podemos aplicar ajustes automáticos
        if (updates.type) {
            if (updates.type === 'central') this.gondola.shelfDepth = this.gondola.depth * 2;
            if (updates.type === 'refrigerado') this.gondola.baseHeight = 25; // Murales suelen tener base alta
        }

        this._buildShelves();
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
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
            const prod = this.getProductById(p.productId);
            return sum + (prod ? prod.width * p.facings : 0);
        }, 0);
    }

    getShelfAvailableWidth(shelfIndex) {
        return this.gondola.shelfWidth - this.getShelfUsedWidth(shelfIndex);
    }

    placeProduct(shelfIndex, productId, facings = 1) {
        const product = this.getProductById(productId);
        const shelf = this.gondola.shelves[shelfIndex];
        if (!product || !shelf) return { success: false, reason: 'Error interno' };

        const requiredWidth = product.width * facings;
        const availableWidth = this.getShelfAvailableWidth(shelfIndex);
        const usableHeight = this.getShelfUsableHeight(shelfIndex);

        if (availableWidth < requiredWidth) {
            return { 
                success: false, 
                reason: `Sin espacio lineal. \nRequerido: ${requiredWidth}cm \nDisponible: ${availableWidth.toFixed(1)}cm` 
            };
        }

        if (product.height > usableHeight) {
            return { 
                success: false, 
                reason: `Producto muy alto. \nAltura: ${product.height}cm \nEspacio libre: ${usableHeight.toFixed(1)}cm` 
            };
        }

        shelf.products.push({
            productId: productId,
            facings: facings,
            stacks: 1,
            x: this.getShelfUsedWidth(shelfIndex),
            placedAt: Date.now()
        });

        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return { success: true };
    }

    stackProduct(shelfIndex, placementIndex) {
        const shelf = this.gondola.shelves[shelfIndex];
        const p = shelf.products[placementIndex];
        const prod = this.getProductById(p.productId);
        const usableHeight = this.getShelfUsableHeight(shelfIndex);
        const nextStackHeight = prod.height * (p.stacks + 1);

        if (nextStackHeight > usableHeight) {
            return { 
                success: false, 
                reason: `Sin espacio vertical. \nAltura proyectada: ${nextStackHeight}cm \nEspacio libre: ${usableHeight.toFixed(1)}cm` 
            };
        }
        p.stacks++;
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
        return { success: true };
    }

    removeFromShelf(sIdx, pIdx) {
        this.gondola.shelves[sIdx].products.splice(pIdx, 1);
        this.emit('gondola:updated', this.gondola);
        this.emit('dashboard:update');
    }
}
