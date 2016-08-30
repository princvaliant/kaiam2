domainLocation = {
    type: 'location',
    printBarCode: true,
    _start: {
        roles: ['INVENTORY_MANAGEMENT', 'ORDER_MANAGEMENT', 'DASHBOARD_ACCESS', 'ADMIN'],
        next: ['Created']
    },
    Created: {
        roles: {
            m: ['INVENTORY_MANAGEMENT', 'ORDER_MANAGEMENT', 'DASHBOARD_ACCESS', 'ADMIN'],
            v: ['INVENTORY_MANAGEMENT', 'ORDER_MANAGEMENT', 'DASHBOARD_ACCESS', 'ADMIN'],
            e: ['INVENTORY_MANAGEMENT', 'ORDER_MANAGEMENT', 'DASHBOARD_ACCESS', 'ADMIN']
        },
        next: []
    }
};