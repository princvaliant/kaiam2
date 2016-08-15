'use strict';


Meteor.methods({

    'addTransceiverToRma': function (snum, rmaId, note) {
        check(snum, String);
        check(rmaId, String);
        let user = ScesDomains.isLoggedIn(this.userId);
        let isShipout = true;
        if (snum.length < 8) {
            return ScesDomains.addEvent(rmaId, 'error', 'Invalid transceiver serial number', snum);
        }
        // Check if this is valid rma
        let rma = ScesDomains.getDomain(rmaId);
        if (!rma) {
            return ScesDomains.addEvent(rmaId, 'error', 'Invalid return request ID', snum);
        }
        // Check if this serial number exists
        let transceiver = ScesDomains.getDomain(snum);
        if (!transceiver) {
            isShipout = false;
        } else {
            // Check if this serial number was shipped to that customer
            let order = Domains.findOne({
                type: 'salesOrder',
                _id: {$in: transceiver.parents || []}
            });
            if (!order || order.dc['Name (Sold-To)'] !== user.profile.company) {
                return ScesDomains.addEvent(rmaId, 'error', 'Invalid sales order', snum);
            }
            // Check if this serial number is already in rma
            let inRma = Domains.findOne({
                type: 'rma',
                _id: {$in: transceiver.parents || []}
            });
            if (inRma) {
                return ScesDomains.addEvent(rmaId, 'error', 'Transceiver is already assigned to return request', snum);
            }
        }
        // Add transceiver to return
        if (isShipout) {
            ScesDomains.move(user._id, snum, [rmaId], [], {returnNote: note || '',  isShipout: true}, [], 'AddedToReturn');
        } else {
            ScesDomains.create('transceiver', user._id, snum, [rmaId, Meteor.user().profile.company], {
                returnNote: note || '',
                state: 'AddedToReturn',
                isShipout: false,
            }, [], 8);
        }

        ScesDomains.addEvent(rmaId, 'add',
            'Transceiver added to return request', snum);
        return '';
    },

    'removeTransceiverFromRma': function (snum, rmaId) {
        check(snum, String);
        check(rmaId, String);
        let user = ScesDomains.isLoggedIn(this.userId);
        if (snum) {
            // Remove transceiver from return
            ScesDomains.move(user._id, snum, [], [rmaId], {returnNote: ''}, [], 'AddedToOrder');
            ScesDomains.addEvent(rmaId, 'remove',
                'Transceiver removed from return request.', snum);
            return '';
        }
    },

    'submitRmaToKaiam': function (rmaId) {
        check(rmaId, String);
        let user = ScesDomains.isLoggedIn(this.userId);
        let domain = ScesDomains.getDomain(rmaId);
        if (domain && domain.state.id === 'Created') {
            // Submit rma to kaiam
            ScesDomains.move(user._id, rmaId, []);
        }
    },

    'deleteRma': function (rmaId) {
        check(rmaId, String);
        let user = ScesDomains.isLoggedIn(this.userId);
        if (rmaId) {
            Domains.find({parents: rmaId}).forEach((domain) => {
                ScesDomains.move(user._id, domain._id, [], [rmaId], {returnNote: ''}, [], 'AddedToOrder');
            });
            DomainEvents.remove({domainId: rmaId});
            Domains.remove(rmaId);
        }
    },

    // Kaiam employee can move RMA
    'moveRma': function(rmaId, state, note) {
        check(rmaId, String);
        let user = ScesDomains.getUser(this.userId);
        let dc = {};
        if (state === 'Declined') {
            dc.declineNote = note;
        }
        if (state === 'Approved') {
            dc.approveNote = note;
        }
        if (state === 'Processing') {
            dc.receiveNote = note;
        }
        if (state === 'Shipped') {
            dc.shipNote = note;
            checkReplacements(this.userId, rmaId);
        }
        ScesDomains.move(user._id, rmaId, [], [], dc, {}, state);
    }
});

function checkReplacements(userId, rmaId) {
    Domains.find({parents: rmaId}).forEach((domain) => {
        let msg = checkTransceiverForRma(userId, domain, domain.dc.returnReplacement, rmaId);
        if (!msg) {
            throw new Meteor.Error(msg);
        }
    });
}


function checkTransceiverForRma(userId, orig, replId, rmaId) {
    check(replId, String);
    check(rmaId, String);
    if (replId.length < 8) {
        return ScesDomains.addEvent(rmaId, 'error', 'Invalid serial number', replId);
    }
    // Check if this serial number is already assigned
    let domain = ScesDomains.getDomain(replId);
    if (domain) {
        return ScesDomains.addEvent(rmaId, 'error', 'SCES.ITEM-ALREADY-ASSIGNED', replId);
    }
    // Check if this serial number successfully passed through packout
    let regsnum = new RegExp(replId, 'i');
    let td = Testdata.findOne({
        'device.SerialNumber': {
            $regex: regsnum
        },
        type: 'packout',
        subtype: '',
        status: 'P',
        result: 'OK'
    }, {
        fields: {
            'device': 1
        },
        sort: {
            timestamp: -1
        }
    });
    if (!td) {
        return ScesDomains.addEvent(rmaId, 'error', 'SCES.ERROR-NO-PACKOUT', replId);
    }
    // Check if replacement part number matches original
    if (orig.device.PartNumber !== domain.device.PartNumber) {
        return ScesDomains.addEvent(rmaId, 'error', 'SCES.PART-NUMBER-NO-MATCH', replId);
    }
    return '';
}

function addTransceiverForRma(orig, replId, rmaId) {
    check(replId, String);
    check(rmaId, String);
    // Insert transceiver into domains table
    ScesDomains.create('transceiver', userId, replId, [rmaId], orig.device, [orig.device.ContractManufacturer]);
    ScesDomains.addEvent(rmaId, 'add',
        replId + ' transceiver added as replacement for ' + orig._id);
    return '';
}