const processData = require('./process-product').processData

const EventEmitter = require('events')
class ProductEventEmitter extends EventEmitter {}
const productEventEmitter = new ProductEventEmitter()

productEventEmitter.on('collected', r => processData(r))

module.exports.productEventEmitter = productEventEmitter