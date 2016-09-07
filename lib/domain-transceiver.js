domainTransceiver = {
    type: 'transceiver',
    printBarCode: false,
    _start: {
        roles: ['SYSTEM', 'INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR', 'CUSTOMER_ACCESS'],
        next: ['AddedToTray']
    },
    AddedToTray: {
        roles: {
            m: ['INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR'],
            v: ['INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR'],
            e: ['INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR']
        },
        next: ['AddedToOrder']
    },
    AddedToLocation: {
        roles: {
            m: ['INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR'],
            v: ['INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR'],
            e: ['INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR']
        },
        next: ['AddedToLocation']
    },
    AddedToOrder: {
        roles: {
            m: ['ORDER_MANAGEMENT', 'CUSTOMER', 'CUSTOMER_ACCESS'],
            v: ['INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR', 'CUSTOMER_ACCESS'],
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