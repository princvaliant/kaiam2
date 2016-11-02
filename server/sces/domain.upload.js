'use strict';
import {check} from 'meteor/check';


Meteor.methods({

    uploadBuild: function (options, search, domain) {
        ScesDomains.isLoggedIn(this.userId);

        let i = 0;
        _.each(array, (o) => {
            if (o[0] && o[2] && o[3] && o[4]) {
                let dom = Domains.findOne(
                    {_id: o[0]});
                if (dom) {
                    Domains.update({_id: o[0]}, {
                        $set: {
                            'dc.TOSA': o[2],
                            'dc.ROSA': o[3],
                            'dc.PCBA': o[4],
                            'dc.TOSAPart': o[5]
                        },
                        $addToSet: {
                            tags: {
                                $each: [o[2], o[3], o[4]]
                            }
                        }
                    });
                    i += 1;
                }
                console.log(i);
            }
        });
        console.log(i + ' done');
        return i;
    }
});






















































