
domainTray = {
    type: 'tray',
    printBarCode: true,
    _start: {
        roles: ['INVENTORY_MANAGEMENT'],
        next: ['Created']
    },
    Created: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT', 'ORDER-MANAGEMENT'],
            e: ['INVENTORY_MANAGEMENT']
        },
        next: ['AddedToOrder']
    },
    AddedToOrder: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT', 'ORDER-MANAGEMENT'],
            e: []
        },
        next: ['Created']
    }
};