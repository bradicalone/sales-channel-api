
class Products {
    constructor(db) {
        this.collections = db.collection('collections');
    }
    /* user - Object */
    async updateProduct(productObj) {
        const product = await this.collections.updateOne(
            { "id": productObj.id },
            { $setOnInsert: productObj }
        );
        return product;
    }

    async addProducts(productsArray) {
        const products = await this.collections.insertMany(
            productsArray
        );
        return products;
    }

    /**
     * @param {Object} id Get collection by BulkOperation id or collection id
        { 'bulkOperation.id': 'gid://shopify/BulkOperation/1603039428762' }
        or
        { 'collection.id': 'gid://shopify/Collection/282477232282' }
     * @returns {Object} collection 
     */
    async getCollection(id) {
        console.log('id getcollection product.js 22:', id)
        const collection  = await this.collections.findOne(id);
        console.log('collection product.js 22:', collection)
        return collection;
    }

    /**
     * 
     * @param {Number|String} id Id of collection used for the front end of website to get collection by id in shopify-routes.js
     * @returns {Object} Collection
     */
    async getCollectionProducts(id) {
        console.log('id getcollection product.js 40:', id)
        const {collection}  = await this.collections.findOne({'collection.id': `gid://shopify/Collection/${id}`});
        return collection;
    }

    // Update collection by collection id
    async updateCollection(document) {
        console.log('document updating to database prduct.js 40:')
        const collection = await this.collections.updateOne(
            { 'collection.id': document.collection.id },
            { $set: { collection: document.collection } }
        );
        return collection
    }

    /**
     * 
     * @param {Object} document 
     * @returns @returns {Object} collection 
     */
    async updateDocumentByCollectionId(document) {
        console.log('document updating to database prduct.js 40:')
        const collection = await this.collections.updateOne(
            { 'collection.id': document.collection.id },
            { $set: document }
        );
        return collection
    }

    // Add collection if it doesn't exist
    async addCollection(document) {
        const collection = await this.collections.update(
            { 'collection.id': document.collection.id }, // query check for collection by collection id
            { $setOnInsert: { ...document } }, // new doc field
            { upsert: true } // Will only insert new document if collection id doesn't exist
        )
        return collection;
    }
}
module.exports = Products;