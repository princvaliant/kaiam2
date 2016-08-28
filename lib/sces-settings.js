/**
 * @ngdoc object
 * @name bpDefPackout
 * @module kaiamSces
 * @description  Process definition for packout.
 * CODE represents tray ID
 */
let transceiver = {
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

let tray = {
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

let shipment = {
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

let rma = {
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


let batchRequest = {
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


let salesOrder = {
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

ScesSettings = {
    domains: [
        batchRequest,
        rma,
        transceiver,
        tray,
        shipment,
        salesOrder
    ],
    trayTypes: [
        '2x6',
        '3x8',
        '4x8',
        '2x10'
    ],
    saleOrderFields: {
        'Order': function (o) {
            return o;
        },
        'Line': function (o) {
            return parseInt(o);
        },
        'Item Number': function (o) {
            return o;
        },
        'Order Date': function (o) {
            return moment(o, 'MM/DD/YYYY').toDate();
        },
        'Name (Sold-To)': function (o) {
            return o;
        },
        'Purchase Order': function (o) {
            return o;
        },
        'Description': function (o) {
            return o;
        },
        'Qty Ordered': function (o) {
            if (o) {
                return parseInt(o.replace(',', ''));
            }
            return 0;
        },
        'Quantity Open': function (o) {
            if (o) {
                return parseInt(o.replace(',', ''));
            }
            return 0;
        },
        'Qty Shipped': function (o) {
            if (o) {
                return parseInt(o.replace(',', ''));
            }
            return 0;
        },
        'Due Date': function (o) {
            return moment(o, 'MM/DD/YYYY').toDate();
        },
        'ATTN (Ship to)': function (o) {
            return o;
        },
        'Address': function (o) {
            return o;
        },
        'Address 2': function (o) {
            return o;
        },
        'City': function (o) {
            return o;
        },
        'STATE_(SHIP-TO)': function (o) {
            return o;
        },
        'ZIP': function (o) {
            return o;
        },
        'Country': function (o) {
            return o;
        }
    },
    columnsCommon: [{
        descendFirst: true,
        name: 'Date',
        field: 'state.when',
        type: 'date'
    }, {
        name: 'Domain',
        field: 'type'
    }, {
        name: 'State',
        field: 'state.id'
    }],
    columns: {
        salesOrder: [{
            name: 'Order#',
            field: 'dc.Order'
        }, {
            name: 'Customer#',
            field: 'dc.Name (Sold-To)'
        }, {
            name: 'Part#',
            field: 'dc.Item Number'
        }, {
            name: 'Line',
            field: 'dc.Line'
        }, {
            name: 'Qty Ordered',
            title: 'Order qty',
            field: 'dc.Qty Ordered',
            type: 'number'
        }, {
            name: 'Quantity Open',
            title: 'Open qty',
            field: 'dc.Quantity Open',
            type: 'number'
        }],
        shipment: [{
            name: 'Sales order',
            field: 'parents'
        }],
        transceiver: [{
            name: 'Serial#',
            field: '_id'
        }, {
            name: 'Part#',
            field: 'dc.pnum'
        }],
        tray: [{
            name: 'Type',
            field: 'dc.type'
        }, {
            name: 'Part#',
            field: 'dc.pnum'
        }],
        rma: [{
            name: 'ID#',
            field: '_id'
        }, {
            name: 'User',
            field: 'state.movedBy'
        }],
        batchRequest: [{
            name: 'name',
            field: 'dc.name'
        }, {
            name: 'partNumber',
            field: 'dc.partNumber'
        }, {
            name: 'revision',
            field: 'dc.Revision'
        }, {
            name: 'dueTime',
            title: 'Due time',
            field: 'dc.dueTime'
        }]
    },
    actions: {
        salesOrder: [{
            name: 'New shipment',
            icon: 'local-shipping',
            link: 'shipment?soid='
        }]
    },
    roles: ['INVENTORY_MANAGEMENT', 'ORDER_MANAGEMENT', 'DASHBOARD_ACCESS', 'ADMIN', 'CUSTOMER_ACCESS'],

    // Get role query for view based on logged in user
    getRoleQuery: function(user) {
        let ret = {
            '$or': []
        };
        _.each(this.domains, (domain) => {
            for (let step in domain) {
                if (step !== '_start' && domain[step].hasOwnProperty('roles')) {
                    let roles = domain[step].roles.v;
                    if (_.intersection(user.profile.roles, roles).length > 0) {
                        ret.$or.push({
                            type: domain.type,
                            'state.id': step
                        });
                    }
                }
            }
        });
        return ret;
    },

    constructQuery: function (user, search, domainFilter) {
        let query = {
            '$and': []
        };
        if (domainFilter !== null && domainFilter.trim() !== '') {
            query.$and.push({
                type: domainFilter
            });
        }
        let regexp = new RegExp('^' + search, 'i');
        if (search !== null && search.trim() !== '') {
            query.$and.push({
                $or: [{
                    '_id': regexp
                }, {
                    'tags': regexp
                }]
            });
        }
        let rq = this.getRoleQuery(user);
        query.$and.push(rq);
        return query;
    }
};


// vars: {
//   orderNum : {title: 'Order#', type: 'string', edit: true, unique: true, search: true, required: true},
//   customer : {title: 'Buyer', type: 'string', edit: true, search: true, required: true},
//   customerPo : {title: 'Buyer PO#', type: 'string', edit: true, search: true, required: false},
// },
// varsList: {
//   partNumber : {title: 'Part#',  type: 'string', edit: true, required: true},
//   qty : {title: 'Quantity', type: 'int', edit: true, required: true}
// }
