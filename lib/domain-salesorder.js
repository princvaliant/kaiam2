
domainSalesOrder = {
    _id: 'SO0001',
    type: 'salesOrder',
    version: '1.1',
    _start: {
        roles: ['ORDER_MANAGEMENT'],
        next: ['Open']
    },
    Open: {
        roles: {
            m: ['ORDER_MANAGEMENT'],
            v: ['ORDER_MANAGEMENT', 'INVENTORY_MANAGEMENT'],
            e: []
        },
        next: ['Fulfilled']
    },
    Fulfilled: {
        roles: {
            m: ['ORDER_MANAGEMENT'],
            v: ['ORDER_MANAGEMENT'],
            e: []
        },
        next: []
    }
};