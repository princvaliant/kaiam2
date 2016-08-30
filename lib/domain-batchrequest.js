
domainBatchRequest = {
    type: 'batchRequest',
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
        next: ['Submitted']
    },
    Submitted: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT'],
            e: ['INVENTORY_MANAGEMENT']
        },
        next: ['Approved', 'Declined']
    },
    Approved: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT'],
            e: ['INVENTORY_MANAGEMENT']
        },
        next: ['Processing']
    },
    Processing: {
        roles: {
            m: ['INVENTORY_MANAGEMENT'],
            v: ['INVENTORY_MANAGEMENT'],
            e: ['INVENTORY_MANAGEMENT']
        },
        next: ['Completed']
    },
    Completed: {
        roles: {
            m: [],
            v: ['INVENTORY_MANAGEMENT'],
            e: []
        },
        next: []
    }
};