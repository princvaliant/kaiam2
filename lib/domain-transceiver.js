domainTransceiver = {
    type: 'transceiver',
    printBarCode: false,
    _start: {
        roles: ['SYSTEM', 'INVENTORY_MANAGEMENT', 'CUSTOMER_ACCESS'],
        next: ['AddedToTray']
    },
    AddedToTray: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT'],
            e: ['INVENTORY_MANAGEMENT']
        },
        next: ['AddedToOrder']
    },
    AddedToOrder: {
        roles: {
            m: ['ORDER_MANAGEMENT', 'CUSTOMER', 'CUSTOMER_ACCESS'],
            v: ['INVENTORY_MANAGEMENT', 'CUSTOMER_ACCESS'],
            e: []
        },
        next: ['AddedToReturn']
    },
    AddedToReturn: {
        roles: {
            m: ['ORDER_MANAGEMENT', 'CUSTOMER_ACCESS'],
            v: ['ORDER_MANAGEMENT', 'CUSTOMER_ACCESS'],
            e: ['ORDER_MANAGEMENT', 'CUSTOMER_ACCESS']
        },
        next: ['AddedToOrder']
    }
};