/* ============================================
   CALCULATOR.JS - Motor de Cálculos de Espacio
   ============================================ */

class SpaceCalculator {
    constructor(state) {
        this.state = state;
    }

    /** Cuántas unidades caben en profundidad (Eje Z) */
    depthUnits(shelfDepth, productDepth) {
        if (productDepth <= 0) return 0;
        return Math.floor(shelfDepth / productDepth);
    }

    /** Cuántos facings caben en el ancho restante */
    maxFacings(availableWidth, productWidth) {
        if (productWidth <= 0) return 0;
        return Math.floor(availableWidth / productWidth);
    }

    /** Cuántos se pueden apilar en la altura disponible */
    stackCapacity(usableHeight, productHeight) {
        if (productHeight <= 0) return 0;
        return Math.floor(usableHeight / productHeight);
    }

    /** Capacidad total teórica de un producto en un estante */
    shelfCapacity(shelfIndex, productId) {
        const product = this.state.getProductById(productId);
        if (!product) return null;

        const g = this.state.gondola;
        const facings = this.maxFacings(g.shelfWidth, product.width);
        const depth = this.depthUnits(g.shelfDepth, product.depth);
        const usableH = this.state.getShelfUsableHeight(shelfIndex);
        const stacks = this.stackCapacity(usableH, product.height);
        const total = facings * depth * stacks;

        return {
            facings,
            depthUnits: depth,
            stacks,
            totalUnits: total,
            totalValue: total * product.price
        };
    }

    /** Estadísticas globales del planograma */
    getGlobalStats() {
        const g = this.state.gondola;
        let totalValue = 0;
        let totalUnits = 0;
        let totalWidthUsed = 0;
        let totalWidthAvailable = 0;
        const skuSet = new Set();
        const perShelf = [];

        g.shelves.forEach((shelf, idx) => {
            const usedWidth = this.state.getShelfUsedWidth(idx);
            const availWidth = g.shelfWidth;
            let shelfUnits = 0;
            let shelfValue = 0;

            shelf.products.forEach(placement => {
                const product = this.state.getProductById(placement.productId);
                if (!product) return;

                const depth = this.depthUnits(g.shelfDepth, product.depth);
                const units = placement.facings * placement.stacks * depth; // Multiplicar por stacks (Y)
                shelfUnits += units;
                shelfValue += units * product.price;
                skuSet.add(placement.productId);
            });

            totalValue += shelfValue;
            totalUnits += shelfUnits;
            totalWidthUsed += usedWidth;
            totalWidthAvailable += availWidth;

            perShelf.push({
                shelfIndex: idx,
                usedWidth,
                availableWidth: availWidth,
                occupationPercent: availWidth > 0 ? (usedWidth / availWidth) * 100 : 0,
                units: shelfUnits,
                value: shelfValue,
                productCount: shelf.products.length
            });
        });

        const overallOccupation = totalWidthAvailable > 0
            ? (totalWidthUsed / totalWidthAvailable) * 100 : 0;

        return {
            totalValue,
            totalUnits,
            totalSKUs: skuSet.size,
            overallOccupation,
            perShelf
        };
    }
}
