'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;
require('date-utils');

class Kyp extends Contract {

    async initLedger(ctx) {
     
    }

    /**
     * Add new customer
     * @param {Context} ctx 
     */
    async createCustomer(ctx){
        
        let cid = new ClientIdentity(ctx.stub);
        if (!cid.assertAttributeValue("role", "customer")) {
            throw new Error('Only customer');
        }
        const kyp = {
            access_list: [],
            allowed_list: [],
            product_info: [],
        }

        const id = this.getCallerId(ctx);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(kyp)));

        return true;
    }

    /**
     * Add new empty marketplace
     * @param {Context} ctx 
     */
    async createMarketPlace(ctx){
        
        let cid = new ClientIdentity(ctx.stub);
        if (!cid.assertAttributeValue("role", "marketPlace")) {
            throw new Error('Only marketplaces');
        }

        const kyp = {
            allowed_list: [],
        }

        const id = this.getCallerId(ctx);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(kyp)));

        return true;
    }

    /**
     * Add new product information to a customer
     * @param {Context} ctx 
     * @param {string} productId 
     * @param {string} info 
     */
    async verifyProduct(ctx, productId, info){
        const caller = this.getCallerId(ctx);

        let cid = new ClientIdentity(ctx.stub);
        if (!cid.assertAttributeValue("role", "marketPlace")) {
            throw new Error('Only marketplace');
        }

        
        const productAsByte = await ctx.stub.getState(productId);
        if (!productAsByte || productAsByte.length === 0) {
            throw new Error(`${productId} does not exist`);
        }
        const kyp = JSON.parse(productAsByte.toString());

        
        const permission = kyp.access_list.filter(access => {
            return access.id == caller;
        });
        if (!permission || permission.length === 0) {
            throw new Error(`${caller} is not allowed to modify`);
        }
        
       
        var now = new Date();
        const product_info = {
            date: now.toFormat("YYYY/MM/DD PP HH:MI"),
            writer_id: caller,
            information: info,
        }
        kyp.product_info.push(product_info);

        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(kyp)));

        return true;
    }

    /**
     * Return 
     * @param {Context} ctx 
     */
    async getMyProductInfo(ctx){
        const caller = this.getCallerId(ctx);

      
        const productAsByte = await ctx.stub.getState(caller);
        if (!productAsByte || productAsByte.length === 0) {
            throw new Error(`${caller} does not exist`);
        }
        const record = JSON.parse(productAsByte.toString());

        return JSON.stringify(record.product_info);
    }

    async getProductInfobyId(ctx, productId){
        const caller = this.getCallerId(ctx);

        
        const productAsByte = await ctx.stub.getState(productId);
        if (!productAsByte || productAsByte.length === 0) {
            throw new Error(`${productId} does not exist`);
        }
        const kyp = JSON.parse(productAsByte.toString());

        
        const permission = kyp.access_list.filter(access => {
            return access.id == caller;
        });
        if (!permission || permission.length === 0) {
            throw new Error(`${caller} is not allowed to modify `);
        }

        return JSON.stringify(kyp.product_info);
    }

  

    /**
     * Return all permissioned users
     * @param {Context} ctx 
     */
    async getAccessList(ctx){
        const caller = this.getCallerId(ctx);

        
        let cid = new ClientIdentity(ctx.stub);
        if (!cid.assertAttributeValue("role", "marketPlace")) {
            throw new Error('Only marketplace can get the access list');
        }

       
        const productAsByte = await ctx.stub.getState(caller);
        if (!productAsByte || productAsByte.length === 0) {
            throw new Error(`${caller} does not exist`);
        }
        const kyp = JSON.parse(productAsByte.toString());

        return JSON.stringify(kyp.access_list);
    }

    /**
     * Return all allowed users
     * @param {Context} ctx 
     */
    async getAllowedList(ctx){// *all permission users*
        const caller = this.getCallerId(ctx);

        // Get record
        const productAsByte = await ctx.stub.getState(caller);
        if (!productAsByte || productAsByte.length === 0) {
            throw new Error(`${caller} does not exist`);
        }
        const record = JSON.parse(productAsByte.toString());

        return JSON.stringify(record.allowed_list);
    }

    

    /**
     * Add a user to access_list and allowed_list
     * @param {Context} ctx 
     * @param {string} id target user id
     * @param {string} role target's role
     */
    async addPermission(ctx, id, role){
        const caller = this.getCallerId(ctx);
        const callerRole = this.getCallerRole(ctx);

        
        const productAsByte = await ctx.stub.getState(caller);
        if (!productAsByte || productAsByte.length === 0) {
            throw new Error(`${caller} does not exist`);
        }
        const kyp = JSON.parse(productAsByte.toString());

        const productAllowedAsByte = await ctx.stub.getState(id);
        if (!productAllowedAsByte || productAllowedAsByte.length === 0) {
            throw new Error(`${id} does not exist`);
        }
        const productAllowed = JSON.parse(productAllowedAsByte.toString());

        // Add permission
        const permission = kyp.access_list.filter(access => {
            return access.id == id;
        });
        if (!permission || permission.length === 0) {
            kyp.access_list.push({
                id: id,
                role: role,
            });
        }

        const allowed = productAllowed.allowed_list.filter(allowed => {
            return allowed.id == caller;
        });
        if (!allowed || allowed.length === 0) {
            productAllowed.allowed_list.push({
                id: caller,
                role: callerRole,
            });
        }

        await ctx.stub.putState(caller, Buffer.from(JSON.stringify(kyp)));
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(productAllowed)));

        return true;
    }

 
  


    getCallerId(ctx) {
        let cid = new ClientIdentity(ctx.stub);
        const idString = cid.getID();
        const idParams = idString.toString().split('::');
        return idParams[1].split('CN=')[1];

    }

    getCallerRole(ctx) {
        let cid = new ClientIdentity(ctx.stub);
        return cid.getAttributeValue("role");

    }
}

module.exports = Kyp;
