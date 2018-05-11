/**
 * @module voxbone
 */

'use strict';

const request   = require('request-promise');
const config    = require('./config');

/**
 * Voxbone Class
 */
class Voxbone {
    /**
     * Create a Voxbone object
     * 
     * @param  {sting} user - Voxbone user
     * @param  {string} password - Voxbone password
     * @param  {string} url - Voxbone REST API url
     */
    constructor(user = config.user, password = config.password, url = config.url) {
        this.user       = user;
        this.password   = password;
        this.url        = url;
    }

    /**
     * Create new cart
     * 
     * @method createCart
     * @param  {object} options
     * @return {Promise} JSON
     */
    createCart(options = {}) {
        return new Promise((resolve, reject) => {
            let url = this.url + 'ordering/cart';

            let body = {};

            if (options.customerReference) body.customerReference = options.customerReference;
            if (options.description) body.description = options.description;

            resolve(this._sendRequest('PUT', url, body));
        });
    }

    /**
     * Add selected product to cart
     * 
     * @method addToCart
     * @param {object} options
     * @return {Promise} JSON
     */
    addToCart(options = {}) {
        return new Promise((resolve, reject) => {
            if (!options.cartIdentifier) {
                reject('cartIdentifier is a required parameter');
            }

            let url = this.url + 'ordering/cart/' + options.cartIdentifier+ '/product';

            let body = {};

            if (options.didCartItem) body.didCartItem = options.didCartItem;
            if (options.capacityCartItem) body.capacityCartItem = options.capacityCartItem;
            if (options.creditPackageCartItem) body.creditPackageCartItem = options.creditPackageCartItem;

            resolve(this._sendRequest('POST', url, body));
        });
    }

    /**
     * List items in specific cart
     * 
     * @method getCart
     * @param  {string} cartIdentifier - unique cart ID
     * @return {Promise} JSON
     */
    getCart(cartIdentifier) {
        return new Promise((resolve, reject) => {
            if (!cartIdentifier) {
                reject('cartIdentifier is a required parameter');
            }

            let url = this.url + 'ordering/cart/' + cartIdentifier;

            resolve(this._sendRequest('GET', url));
        });
    }

    /**
     * List active carts
     * 
     * @method listCart
     * @param  {object} options
     * @return {Promise} JSON
     */
    listCart(options = {}) {
        return new Promise((resolve, reject) => {
            let url = this.url + 'ordering/cart?';
            url += this._appendPages(options);

            if (options.cartIdentifier) url += '&cartIdentifier=' + options.cartIdentifier;
            if (options.reference) url += '&reference=' + options.reference;

            resolve(this._sendRequest('GET', url));
        });
    }

    /**
     * Checkout open cart by cartIdentifier
     * 
     * @method checkoutCart
     * @param  {string} cartIdentifier - unique cart ID
     * @return {Promise} JSON
     */
    checkoutCart(cartIdentifier) {
        return new Promise((resolve, reject) => {
            if (!cartIdentifier) {
                reject('cartIdentifier is a required parameter');
            }

            let url = this.url + 'ordering/cart/' + cartIdentifier + '/checkout';

            resolve(this._sendRequest('GET', url));
        });
    }

    /**
     * Get information about current orders
     * 
     * @method listOrder
     * @param {object} options
     * @return {Promise} JSON
     */
    listOrders(options = {}) {
        return new Promise((resolve, reject) => {
            let url = this.url + 'ordering/order?';
            url += this._appendPages(options);

            if (options.reference) url += '&reference=' + options.reference;
            
            resolve(this._sendRequest('GET', url));
        });
    }

    /**
     * Release selected IDs
     * 
     * @method cancelDIDs
     * @param  {array} didIds - array of DIDs to release
     * @return {Promise} JSON
     */
    cancelDIDs(didIds = []) {
        return new Promise((resolve, reject) => {
            if (!didIds.length){
                reject('No DIDid provided.');
            }

            let body = { didIds: didIds };
            let url = this.url + 'ordering/cancel';
            resolve(this._sendRequest('POST', url, body));
        });
    }

    /**
     * Retrieve information about account balance
     *
     * @method accountBalance
     * @return {Promise} JSON
    */
    accountBalance() {
        return new Promise((resolve, reject) => {
            let url = this.url + 'ordering/accountbalance';
            resolve(this._sendRequest('GET', url));
        });
    }

    /**
     * List countries by Country code or DID type
     * 
     * @method listCountries
     * @param  {object} options
     * @return {Promise} JSON string
     */
    listCountries(options = {}) {
        return new Promise((resolve, reject) => {
            let url = this.url + 'inventory/country?';
            url += this._appendPages(options);

            if (options.countryCodeA3) url += '&countryCodeA3=' + options.countryCodeA3;
            if (options.didType) url += '&didType=' + options.didType;

            resolve(this._sendRequest('GET', url));
        });
    }

    /**
     * Get availability of DIDs across Voxbone’s inventory
     *
     * @method listDID
     * @param  {object} options - Options
     * @return {Promise} JSON
    */
    listDID(options = {}) {
        return new Promise((resolve, reject) => {
            
            let url = this.url + 'inventory/did?';
            url += this._appendPages(options);

            if (options.didIds) {
                options.didIds.forEach(function(didId) {
                    url += '&didIds=' + didId;
                });
            }

            if (options.didgroupIds) {
                options.didgroupIds.forEach(function(didgroupId) {
                    url += '&didgroupIds=' + didgroupId;
                });
            }

            if (options.e164Pattern) url += '&e164Pattern=' + options.e164Pattern;
            if (options.regulationAddressId) url += '&regulationAddressId=' + options.regulationAddressId;
            if (options.voiceUriId) url += '&voiceUriId=' + options.voiceUriId;
            if (options.faxUriId) url += '&faxUriId=' + options.faxUriId;
            if (options.smsLinkGroupId) url += '&smsLinkGroupId=' + options.smsLinkGroupId;
            if (options.needAddressLink) url += '&needAddressLink=' + options.needAddressLink;
            if (options.serviceType) url += '&serviceType=' + options.serviceType;
            if (options.countryCodeA3) url += '&countryCodeA3=' + options.countryCodeA3;
            if (options.orderReference) url += '&orderReference=' + options.orderReference;
            if (options.portingReference) url += '&portingReference=' + options.portingReference;
            if (options.deliveryId) url += '&deliveryId=' + options.deliveryId;
            if (options.smsOutbound) url += '&smsOutbound=' + options.smsOutbound;
            if (options.webRtcEnabled) url += '&webRtcEnabled=' + options.webRtcEnabled;

            resolve(this._sendRequest('GET', url));
        });
    }

    /**
     * Get availability of DIDs Groups across Voxbone’s inventory
     * 
     * @method listDidGroup
     * @param  {object} options
     * @return {Promise} JSON
     */
    listDidGroup(options = {}) {
        return new Promise((resolve, reject) => {
            if (!options.countryCodeA3) {
                reject('countryCodeA3 is required parameter');
            }

            let url = this.url + 'inventory/didgroup?countryCodeA3=' + options.countryCodeA3;
            url += this._appendPages(options);

            if (options.didGroupIds) {
                options.didGroupIds.forEach(function(didGroupId) {
                    url += '&didGroupIds=' + didGroupId;
                });
            }

            if (options.featureIds) {
                options.featureIds.forEach(function(featureId) {
                    url += '&featureIds=' + featureId;
                });
            }
            
            if (options.stateId) url += '&stateId=' + options.stateId;
            if (options.cityNamePattern) url += '&cityNamePattern=' + options.cityNamePattern;
            if (options.rateCenter) url += '&rateCenter=' + options.rateCenter;
            if (options.areaCode) url += '&areaCode=' + options.areaCode;
            if (options.didType) url += '&didType=' + options.didType;
            if (options.showEmpty) url += '&showEmpty=' + options.showEmpty;

            resolve(this._sendRequest('GET', url));
        });
    }

    /**
     * Allocate DIDs
     * 
     * @method allocate
     * @param  {object} options - Input object to allocate DIDs
     * @param {string} options.countryCode - Indicates the country code in its ISO 3166-1 alpha-3 format. Mandatory
     * @param {string} areaCode - The area code of the DID group (e.g. '1').
     * @param {int} options.quantity - Quantity of requested DIDs
     * @param {array} featureIds - Feature codes such as VoxSMS or VoxFAX. (e.g. 25 for VoxSMS, 50 for Voice).
     * 
     * @return {JSON}
     */
    async allocate(options = {}) {
        if(!options.countryCode) {
            throw new Error('Allocate: countryCode is missing.');
        }

        let q =             {};
        q.countryCodeA3 =   options.countryCode;
        q.quantity =        options.quantity || 1;
        
        // default type ids for Voice & SMS:
        q.featureIds = (options.featureIds instanceof Array) ? options.featureIds : [50];

        if(options.areaCode)
            q.areaCode = options.areaCode;

        let didGroups = await this.listDidGroup(q);

        if(!(didGroups.didGroups instanceof Array)) {
            return {status: 'FAIL', message: 'No DID Group found.'};
        }

        let didGroupId = null;

        for(let i in didGroups.didGroups) {
            if(didGroups.didGroups[i].available &&
                Number(didGroups.didGroups[i].stock) >= q.quantity) {
                didGroupId = didGroups.didGroups[i].didGroupId;
                break;
            }
        }

        if(!didGroupId)
            return {status: 'FAIL', message: 'No DID group available.'};

        let cart = await this.createCart();

        if(!(cart.cart instanceof Object))
            return cart;

        let result = await this.addToCart(
            {
                cartIdentifier: cart.cart.cartIdentifier,
                didCartItem: { didGroupId: didGroupId, quantity: q.quantity }
            }
        );

        if(result.status !== 'SUCCESS')
            return result;

        result = await this.checkoutCart(cart.cart.cartIdentifier);

        if(result.productCheckoutList instanceof Array && result.productCheckoutList.length) {
            result = await this.listDID({ orderReference: result.productCheckoutList[0].orderReference });
            return result;
        }
        
        return result;
    }

    /**
     * Sends requests to Voxbone API
     *
     * @method _sendRequest
     * @param  {string} type - Request type
     * @param  {string} url - Requested url
     * @param  {object} body - Body request
     * @return {string} JSON
     */
    _sendRequest(type, url, body) {
        let header = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        };

        let auth = {
            'user': this.user,
            'pass': this.password
        };

        let options = {
            auth: auth,
            url: url,
            body: body,
            json: true,
            headers: header,
            method: type.toUpperCase()
        };

        return request(options).catch(function(err) {
            return err.error;
        });
    }

    /**
     * Mandatory Voxbone fields: pageNumber, pageSize. Rendering logic
     * 
     * @method  _renderPages
     * @param  {string} url
     * @param  {object} options
     * @return {string} url
     */
    _appendPages(options = {}) {
        let pageNumber, pageSize = null;
        
        if(options.pageNumber && options.pageSize) {
            pageNumber = options.pageNumber;
            pageSize = options.pageSize;
        }
        else {
            pageNumber = config.defaultPageNumber;
            pageSize = config.defaultPageSize;
        }

        return '&pageNumber=' + pageNumber + '&pageSize=' + pageSize;
    }
}

module.exports = Voxbone;
