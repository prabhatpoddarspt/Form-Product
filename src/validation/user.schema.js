import Joi from 'joi';

const schema = {
    validateCreateForm: Joi.object({
        initiaterId: Joi.string().allow(null),
        complainNo: Joi.string().allow(null),
        complainDate: Joi.string().allow(null),
        customerCode: Joi.string().allow(null),
        customerName: Joi.string().allow(null),
        purchasedFrom: Joi.string().allow(null),
        region: Joi.string().allow(null),
        sbu: Joi.string().allow(null),
        invoiceNo: Joi.string().allow(null),
        invoiceDate: Joi.string().allow(null),
        invoiceValue: Joi.string().allow(null),
        category: Joi.string().allow(null),
        invoiceCopy: Joi.string().allow(null),
        productCode: Joi.string().allow(null),
        productName: Joi.string().allow(null),
        productSNO: Joi.string().allow(null),
        productStatus: Joi.string().allow(null),
        installationDate: Joi.string().allow(null),
        tds: Joi.string().allow(null),
        bpNameCode: Joi.string().allow(null),
        waterPressure: Joi.string().allow(null),
        complainHistory: Joi.string().allow(null),
        spareCode: Joi.string().allow(null),
        reason: Joi.string().allow(null),
        decision: Joi.string().allow(null),
        remark: Joi.string().allow(null),
        modeOfPayment: Joi.string().allow(null),
        beneficiaryHolder: Joi.string().allow(null),
        bankName: Joi.string().allow(null),
        accountNo: Joi.string().allow(null),
        ifscCode: Joi.string().allow(null),
        proofDocument: Joi.string().allow(null),
    }),
    validateGetFormById: Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null)
    }),
    validateGetForm: Joi.object({
        page: Joi.number().integer().min(1).allow(null), 
        limit: Joi.number().integer().min(1).allow(null), 
        search: Joi.string().allow(null, ''), 
        sort: Joi.string().allow(null), 
        order: Joi.string().valid('asc', 'desc').allow(null) // Order should be 'asc' or 'desc', or null
    })

};

export default schema;
