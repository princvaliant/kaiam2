'use strict';

import {check} from 'meteor/check';


Meteor.methods({

    'addToLocation': function (trayId, shipment, salesOrder, remainQty) {
        check(trayId, String);
        let user = ScesDomains.getUser(this.userId);

        let tray = ScesDomains.getDomain(trayId);
        if (!tray || ['tray'].indexOf(tray.type) === -1) {
            return ScesDomains.addEvent(shipment._id, 'error', 'SCES.INVALID-ITEM', trayId);
        }
        if (tray.state.id !== 'Created') {
            return ScesDomains.addEvent(shipment._id, 'error', 'SCES.TRAY-ALREADY-ASSIGNED', trayId);
        }
        // Check if tray part number matches transceiver
        if (salesOrder.dc['Item Number'] !== tray.dc.pnum) {
            return ScesDomains.addEvent(shipment._id, 'error', 'SCES.PART-NUMBER-NO-MATCH', trayId);
        }
        // Check if this tray is already assigned to shipment
        let existing = Domains.findOne({
            _id: trayId,
            parents: shipment._id
        });
        if (existing) {
            return ScesDomains.addEvent(shipment._id, 'error', 'SCES.TRAY-ALREADY-ASSIGNED', trayId);
        }
        // Check if quantity associated with tray not exceeding order remaining
        let qtyOnTray = Domains.find({
            type: 'transceiver',
            parents: tray._id
        }, {
            _id: 1
        }).count();
        if (qtyOnTray === 0) {
            return ScesDomains.addEvent(shipment._id, 'error', 'SCES.NO-QTY-ON-TRAY', trayId);
        }
        if (qtyOnTray > remainQty) {
            return ScesDomains.addEvent(shipment._id, 'error', 'SCES.QTY-ON-TRAY-TO-BIG', trayId);
        }
        // Assign all transceivers on this tray to shipment and sales order
        Domains.find({
            type: 'transceiver',
            parents: tray._id
        }).forEach(function (transceiver) {
            ScesDomains.move(user._id, transceiver._id, [salesOrder._id, shipment._id]);
        });
        // Assign tray to shipment
        ScesDomains.move(this.userId, trayId, [salesOrder._id, shipment._id]);
        // Insert domain events to display to user
        return ScesDomains.addEvent(shipment._id, 'add',
            'Tray ' + trayId + ' with ' + qtyOnTray + ' transceivers added to sales order.', trayId);
    },

    'removeFromLocation': function (trayId, shipment, salesOrder) {
        check(trayId, String);
        let user = ScesDomains.getUser(this.userId);
        let tray = ScesDomains.getDomain(trayId);
        if (!tray || tray.type !== 'tray') {
            return ScesDomains.addEvent(shipment._id, 'error', 'SCES.INVALID-ITEM', trayId);
        }
        // Remove all transceivers from sales order and shipment
        Domains.find({
            type: 'transceiver',
            parents: tray._id
        }).forEach(function (transceiver) {
            ScesDomains.move(user._id, transceiver._id, null, [salesOrder._id, shipment._id], null, null, 'AddedToTray');
        });
        // Remove tray from sales order
        ScesDomains.move(this.userId, trayId, null, [salesOrder._id, shipment._id], null, null, 'Created');
        return ScesDomains.addEvent(shipment._id, 'remove',
            'Tray ' + trayId + ' removed from sales order.', trayId);
    },

    'updateLocation': function (id, dc) {
        ScesDomains.getUser(this.userId);
        Domains.update({
            _id: id
        }, {
            $set: {
                tags: [dc.name, dc.subLocation],
                dc: dc
            }
        });
    },

    'deleteLocation': function (location) {
        ScesDomains.getUser(this.userId);
        let existing = Domains.findOne({
            parents: location._id
        });
        if (existing) {
            throw new Meteor.Error('LOCATION-NOT-EMPTY');
        }
        // Submit shipment
        Domains.remove(location._id);
    }
});
