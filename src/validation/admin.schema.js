import Joi from 'joi';

const schema = {
    validateCreateForm: Joi.object({
        initiaterId: Joi.string().allow(null),
        complainNo: Joi.string().allow(null),
        complainDate: Joi.string().allow(null),
        customerCode: Joi.string().allow(null),
        customerName: Joi.string().allow(null),
        purchasedFrom: Joi.string().allow(null),
        region: Joi.string().valid('NORTH', 'SOUTH', 'EAST', 'WEST').allow(null),
        sbu: Joi.string().allow(null),
        invoiceNo: Joi.string().allow(null),
        invoiceDate: Joi.string().allow(null),
        invoiceValue: Joi.string().allow(null),
        category: Joi.string().valid('PRODUCT', 'AMC', 'ADVANCE REFUND').allow(null),
        invoiceCopy: Joi.string().allow(null),
        productCode: Joi.string().allow(null),
        productName: Joi.string().allow(null),
        productSNO: Joi.string().allow(null),
        productStatus: Joi.string().valid('WARRANTY', 'CONTRACT', 'OW & OC').allow(null),
        installationDate: Joi.string().allow(null),
        tds: Joi.string().allow(null),
        bpNameCode: Joi.string().allow(null),
        waterPressure: Joi.string().allow(null),
        complainHistory: Joi.string().allow(null),
        reason: Joi.string().allow(null),
        decision: Joi.string().valid('REPLACEMENT REQUEST', 'RETURN & REFUND', 'ADJUSTMENT').allow(null),
        remark: Joi.string().allow(null),
        modeOfPayment: Joi.string().valid('ONLINE', 'OTHER').allow(null),
        beneficiaryHolder: Joi.string().allow(null),
        bankName: Joi.string().allow(null),
        accountNo: Joi.string().allow(null),
        ifscCode: Joi.string().allow(null),
        proofDocument: Joi.string().allow(null),
    }),
    validateUpdateFormOnClick: Joi.object({
        replacementOrderNo: Joi.string().allow(null),
        refundRemark: Joi.string().allow(null),
        rfmClearances: Joi.string().allow(null),
        refundSap: Joi.string().allow(null),
        utrNo: Joi.string().allow(null),
        refundDate: Joi.string().allow(null),

    }),
    validateCreateAdmin: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address.',
                'any.required': 'Email is required.',
            }),

        password: Joi.string()
            .min(6)
            .messages({
                'string.min': 'Password must be at least 6 characters long.',
                
            }),

        username: Joi.string()
            .min(3)
            .required()
            .messages({
                'string.min': 'Username must be at least 3 characters long.',
                'any.required': 'Username is required.',
            }),

        profileImg: Joi.string()
            .uri()
            .allow(null)
            .messages({
                'string.uri': 'Profile image must be a valid URL.',
            })
        ,
    }),
    validateUpdateAdmin: Joi.object({
        email: Joi.string().allow(null),
        deleted: Joi.string().allow(null),
        status: Joi.string().allow(null),
        username: Joi.string().allow(null),
        profileImg: Joi.string().allow(null),

    }),
    validateGetFormById: Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null)
    })
};

export default schema;
