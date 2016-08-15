'use strict';
/**
 * Publish Current User
 * Defaults: 'username', 'email', 'profile'
 * Adding ?
 * @type {Meteor.publish}
 */
Meteor.publish('imageRequests', function (rack) {
    return ImageRequests.find({rack: rack})
});

Meteor.publish('imageResponses', function (transceiver) {
    return ImageResponses.find({transceiver: transceiver})
});

Meteor.methods({
    insertImageRequests: function (rack, transceiver) {
        return ImageRequests.upsert(
            {
                rack: rack,
                transceiver: transceiver
            });
    },
    deleteImageRequests: function (rack, transceiver) {
        return ImageRequests.remove(
            {
                rack: rack,
                transceiver: transceiver
            });
    },
    insertImageResponses: function (transceiver, name, imageData) {
        return ImageResponses.upsert(
            {
                transceiver: transceiver,
                name: name
            }, {
                transceiver: transceiver,
                name: name,
                imageData: imageData
            });
    }
});


