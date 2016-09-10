'use strict';

Meteor.publish('sars', function (pnum, clss)
{
    if (this.userId) {
        return Sar.find({
            pnum: pnum,
            class: {$in: [clss, null]}
        });
    }
});

Meteor.publish('sar-actions', function (sarId) {
    if (this.userId) {
        return SarAction.find({sarId: sarId}, {});
    }
});

Meteor.publish('sar-action-params', function (sarId) {
    if (this.userId) {
        return SarActionParam.find({sarId: sarId}, {});
    }
});

Meteor.publish('sar-specs', function (sarId) {
    if (this.userId) {
        return SarSpec.find({sarId: sarId}, {});
    }
});

Meteor.publish('sar-spec-ranges', function (sarId) {
    if (this.userId) {
        return SarSpecRange.find({sarId: sarId}, {});
    }
});


