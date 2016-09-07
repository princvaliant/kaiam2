/**
 * @ngdoc object
 * @name ScesSettings
 * @module kaiamSces
 * @description  Process definitions and other settings.
 */

ScesSettings = {
    // Definition of all domains in SCES/MES system
    domains: [
        domainLocation,
        domainBatchRequest,
        domainRma,
        domainTransceiver,
        domainTray,
        domainShipment,
        domainSalesOrder
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
        field: 'type',
        visible: false
    }, {
        name: 'State',
        field: 'state.id'
    }],
    columns: {
        location: [{
            name: 'name',
            field: 'dc.name'
        },  {
            name: 'Sub-location',
            field: 'dc.subLocation'
        }, {
            name: 'description',
            field: 'dc.description'
        }, {
            name: 'room',
            field: 'dc.room'
        }, {
            name: 'shelf',
            field: 'dc.shelf'
        }],
        transceiver: [{
            name: 'Serial#',
            field: '_id'
        }, {
            name: 'Part#',
            field: 'dc.pnum'
        }],
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
    internalRoles: ['INVENTORY_MANAGEMENT', 'INVENTORY_SUPERVISOR', 'ORDER_MANAGEMENT', 'DASHBOARD_ACCESS', 'ADMIN'],
    externalRoles: ['CUSTOMER_ACCESS'],
    roles: function() {
        return _.extend(this.internalRoles, this.externalRoles);
    },

    // Get role query for view based on logged in user
    getRoleQuery: function (user) {
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
                    'tags': search
                }]
            });
        }
        let rq = this.getRoleQuery(user);
        query.$and.push(rq);
        return query;
    },

    getDomainFlowDef: function (domainName) {
        return _.find(this.domains, (d) => {
            return d.type.toLowerCase()  === domainName.toLowerCase();
        });
    },

    isInternalMember: function (user, roles) {
        if (user && user.profile && !user.profile.isClient && _.intersection(user.profile.roles, roles).length > 0) {
            return true;
        }
        return false;
    },

    isClientMember: function (user, roles) {
        if (user && user.profile && user.profile.isClient && _.intersection(user.profile.roles, roles).length > 0) {
            return true;
        }
        return false;
    },

    isAdmin: function (user) {
        if (user && user.profile && !user.profile.isClient && _.intersection(user.profile.roles, ['ADMIN']).length > 0) {
            return true;
        }
        return false;
    }
};