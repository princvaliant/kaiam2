'use strict';

import {check} from 'meteor/check';


Meteor.methods({

    getOpenSalesOrders: function (options, search) {
        ScesDomains.getUser(this.userId);
        let sales = Domains.aggregate([{
            $match: {
                type: 'salesOrder',
                _id: {$ne: 'SO--NaN-undefined'},
                $or: [
                    {'dc.Purchase Order': {$regex: '^' + search}},
                    {'dc.Order': {$regex: '^' + search}},
                    {'dc.Item Number': {$regex: '^' + search}}]
            }
        }, {
            $sort: options.sort || {'state.when': -1}
        },{
            $limit: 20
        }], {
            allowDiskUse: true
        });

        let ids = _.pluck(sales, '_id');
        let trans = getTransceiversShipped(ids);

        _.each(sales, (sale) => {
            let tr = _.findWhere(trans, {_id: sale._id});
            if (tr) {
                sale.dc['Quantity Open'] = sale.dc['Qty Ordered'] - tr.count;
            }
        });

        // console.log(sales[0]);
        return sales;
    },

    importSalesOrders: function (data) {
        ScesDomains.getUser(this.userId);
        let orderDef = data[0].reduce(function (o, v, i) {
            if (_.contains(_.keys(ScesSettings.saleOrderFields), v)) {
                o[i] = v;
            }
            return o;
        }, {});
        for (let i = 1; i < data.length; i++) {
            let obj = {};
            for (let o in orderDef) {
                obj[orderDef[o]] = ScesSettings.saleOrderFields[orderDef[o]](data[i][o]);
            }
            if (obj['Quantity Open'] > 0) {
                obj.state = 'Open';
            } else {
                obj.state = 'Fulfilled';
            }

            let id = 'SO-' + obj.Order + '-' + obj.Line + '-' + obj['Item Number'];
            ScesDomains.create('salesOrder', this.userId, id, null, obj, [obj.Order, obj['Name (Sold-To)']]);
        }
        return data.length - 1;
    },


    importPackouts: function (data) {
        ScesDomains.getUser(this.userId);
        for (let i = 1; i < data.length; i++) {
            let obj = data[i];
            let id = obj[0];
            let pn = obj[1];
            let date = moment(obj[2], 'MM/DD/YY HH:mm').toDate();
            let exists = Domains.findOne({
                _id: id
            });
            if (!exists) {
                let pi = {};
                pi._id = id;
                pi.type = 'transceiver';
                pi.state = {
                    id: 'AddedToTray',
                    movedBy: 'admin',
                    when: date,
                    prev: '_start',
                    next: ''
                };
                pi.dc = {
                    SerialNumber: id,
                    PartNumber: pn
                };
                pi.tags = [];
                pi.parents = [];
                pi.audit = [pi.state];
                Domains.insert(pi);
            }
        }
        return data.length - 1;
    },

    getTransceiversByCm: function (orderId) {
        ScesDomains.getUser(this.userId);
        let q = {
            parents: orderId,
            type: 'transceiver'
        };
        return Domains.aggregate([{
            $match: q
        }, {
            $group: {
                _id: '$dc.ContractManufacturer',
                cnt: {
                    $sum: 1
                }
            }
        }]);
    },

    getShippedQty: function (orderId) {
        ScesDomains.getUser(this.userId);
        let trans =  getTransceiversShipped([orderId]);
        if (trans.length === 1) {
            return trans[0].count;
        } else {
            return 0;
        }
    }

});

function getTransceiversShipped (ids) {
    return Domains.aggregate([{
        $match: {
            parents: {$in: ids},
            type: 'transceiver'
        }
    }, {
        $unwind: '$parents'
    }, {
        $match: {
            parents: {$in: ids},
        }
    }, {
        $group: {
            _id: '$parents',
            count: {$sum: 1}
        }
    }], {
        allowDiskUse: true
    });
}
