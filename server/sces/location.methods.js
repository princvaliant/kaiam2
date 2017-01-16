'use strict';

import {check} from 'meteor/check';


Meteor.methods({
    'createPartAndAddToLocation': function (locationId, transceiver) {
        check(locationId, String);
        let user = ScesDomains.getUser(this.userId);
        let dc = getLatestTestData(transceiver._id);
        let tr = ScesDomains.getDomain(transceiver._id);
        if (tr) {
            addToLocation(locationId, transceiver._id, transceiver, user);
            return transceiver._id;
        } else {
            let retId = ScesDomains.create('transceiver', user._id, transceiver._id, [locationId], {
                pnum: dc.pnum || transceiver.pnum,
                PartNumber: dc.pnum || transceiver.pnum,
                TOSA: transceiver.TOSA,
                ROSA: transceiver.ROSA,
                PCBA: transceiver.PCBA,
                cm: transceiver.cm,
                state: 'AddedToLocation',
                SerialNumber: transceiver._id
            }, [transceiver.TOSA, transceiver.ROSA, transceiver.PCBA]);
            ScesDomains.addEvent(locationId, 'add',
                'Transceiver ' + transceiver._id + ' added to location.', transceiver._id);
            return retId;
        }
    },

    'addToLocation': function (locationId, unitId) {
        addToLocation(locationId, unitId, {}, ScesDomains.getUser(this.userId));
    },

    'removeFromLocation': function (locationId, unitId) {
        check(unitId, String);
        check(locationId, String);
        let user = ScesDomains.getUser(this.userId);
        if (domain.type === 'tray') {
            // If this is tray add tray and all the transceivers to location
            Domains.find({
                type: 'transceiver',
                parents: domain._id
            }).forEach(function (transceiver) {
                ScesDomains.move(user._id, transceiver._id, null, [locationId]);
                return ScesDomains.addEvent(locationId, 'remove',
                    'Transceiver ' + transceiver._id + ' removed from location.', transceiver._id);
            });
            ScesDomains.move(user._id, domain._id, null, [locationId]);
            return ScesDomains.addEvent(locationId, 'remove',
                'Tray ' + domain._id + ' removed from location.', domain._id);
        }
        if (domain.type === 'transceiver') {
            // If this is transceiver add it to location
            ScesDomains.move(user._id, domain._id, null, [locationId]);
            // Insert domain events to display to user
            return ScesDomains.addEvent(locationId, 'remove',
                'Transceiver ' + domain._id + ' removed from location.', domain._id);
        }
        return '';
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
            'state.parentId': location._id
        });
        if (existing) {
            throw new Meteor.Error('LOCATION-NOT-EMPTY');
        }
        // Submit shipment
        Domains.remove(location._id);
    }
});

function addToLocation (locationId, unitId, dc, user) {
    check(unitId, String);
    check(locationId, String);
    let domain = ScesDomains.getDomain(unitId);
    if (domain.type === 'tray') {
        // If this is tray add tray and all the transceivers to location
        Domains.find({
            type: 'transceiver',
            parents: domain._id
        }).forEach(function (transceiver) {
            ScesDomains.move(user._id, transceiver._id, [locationId], null, dc, null, 'AddedToLocation');
            return ScesDomains.addEvent(locationId, 'add',
                'Transceiver ' + transceiver._id + ' added to location.', transceiver._id);
        });
        ScesDomains.move(user._id, domain._id, [locationId], null, null, null, 'AddedToLocation');
        return ScesDomains.addEvent(locationId, 'add',
            'Tray ' + domain._id + ' added to location.', domain._id);
    }
    if (domain.type === 'transceiver') {
        // If this is transceiver add it to location
        ScesDomains.move(user._id, domain._id, [locationId], null, dc, null, 'AddedToLocation');
        // Insert domain events to display to user
        return ScesDomains.addEvent(locationId, 'add',
            'Transceiver ' + domain._id + ' added to location.', domain._id);
    }
    return '';
}

function getLatestTestData (transceiverId) {
    // Custom check for script names
    let td = Testdata.findOne({
        'device.SerialNumber': transceiverId
    }, {
        fields: {
            'device': 1
        },
        sort: {
            timestamp: -1
        }
    });
    if (td) {
        return {
            pnum: td.device.PartNumber
        };
    }
    return {};
}
