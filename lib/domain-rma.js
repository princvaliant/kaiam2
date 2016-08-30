
domainRma = {
    type: 'rma',
    printBarCode: true,
    _start: {
        roles: ['CUSTOMER_ACCESS'],
        next: ['Created']
    },
    Created: {
        roles: {
            m: ['CUSTOMER_ACCESS'],
            v: ['CUSTOMER_ACCESS'],
            e: ['CUSTOMER_ACCESS']
        },
        next: ['Submitted']
    },
    Submitted: {
        roles: {
            m: ['ORDER_MANAGEMENT'],
            v: ['CUSTOMER_ACCESS', 'ORDER_MANAGEMENT'],
            e: ['ORDER_MANAGEMENT']
        },
        next: ['Approved', 'Declined']
    },
    Approved: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['CUSTOMER_ACCESS', 'ORDER_MANAGEMENT', 'INVENTORY_MANAGEMENT'],
            e: ['INVENTORY_MANAGEMENT']
        },
        next: ['Processing']
    },
    Processing: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['CUSTOMER_ACCESS', 'ORDER_MANAGEMENT', 'INVENTORY_MANAGEMENT'],
            e: ['ORDER_MANAGEMENT', 'INVENTORY_MANAGEMENT']
        },
        next: ['Shipped']
    },
    Shipped: {
        roles: {
            m: [],
            v: ['CUSTOMER_ACCESS', 'INVENTORY_MANAGEMENT', 'ORDER-MANAGEMENT'],
            e: []
        },
        next: []
    },
    Declined: {
        roles: {
            m: [],
            v: ['CUSTOMER_ACCESS', 'ORDER_MANAGEMENT'],
            e: []
        },
        next: []
    }
};