function calculatePortionValues(p){
    const product = p.product_json
    const quantity = p.quantity
    return {
        id : p.id,
        productId : product.id,
        name : product.productName,
        quantity: quantity,
        energy : (product.nutritionalValues.energy * 100 * quantity / (100 * 100)).toFixed(2),
        protein : (product.nutritionalValues.protein * 100 * quantity / (100 * 100)).toFixed(2),
        carbohydrates : (product.nutritionalValues.carbohydrates * 100 * quantity / (100 * 100)).toFixed(2),
        fat : (product.nutritionalValues.fat * 100 * quantity / (100 * 100)).toFixed(2)
    }
}

function calculateEatenToday(portions){
    let sum = (a, b) => (1000 * a + 1000 * b) / 1000;
    const isEmpty = portions.length == 0
    return {
        quantity : isEmpty ? 0 : portions.map(p => p.quantity).reduce((a,b) => sum(a, b)),
        energy : isEmpty ? 0 : portions.map(p => calculatePortionValues(p)).map(p => p.energy).reduce((a,b) => sum(a, b)),
        protein : isEmpty ? 0 : portions.map(p => calculatePortionValues(p)).map(p => p.protein).reduce((a,b) => sum(a, b)),
        carbohydrates : isEmpty ? 0 : portions.map(p => calculatePortionValues(p)).map(p => p.carbohydrates).reduce((a,b) => sum(a, b)),
        fat : isEmpty ? 0 : portions.map(p => calculatePortionValues(p)).map(p => p.fat).reduce((a,b) => sum(a, b))
    }
}

module.exports = {
    calculatePortionValues : calculatePortionValues,
    calculateEatenToday : calculateEatenToday
};