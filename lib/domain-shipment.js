
domainShipment = {
    type: 'shipment',
    printBarCode: true,
    _start: {
        roles: ['INVENTORY_MANAGEMENT'],
        next: ['Created']
    },
    Created: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT'],
            e: ['INVENTORY_MANAGEMENT']
        },
        next: ['Sent']
    },
    Sent: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT', 'ORDER-MANAGEMENT'],
            e: []
        },
        next: ['Delivered']
    },
    Delivered: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT', 'ORDER-MANAGEMENT'],
            e: []
        },
        next: []
    }
};
