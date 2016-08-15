

Accounts.config({
    sendVerificationEmail: true,
    restrictCreationByEmailDomain: function (address) {
        let comps = Companies.find().fetch();
        let arr = [];
        _.each(comps, (comp) => {
            _.each(comp.allowedEmails.split(','), (email) => {
                arr.push(email.trim().toLowerCase());
            });
        });
        for (let i in arr) {
            let lcaddr = address.toLowerCase();
            if (lcaddr.indexOf(arr[i]) >= 0) {
                return true;
            }
        }
        return false;
    }
});

Accounts.emailTemplates = {
    from: 'Kaiam App Support <no-reply@kaiam.com>',
    siteName: Meteor.absoluteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),

    resetPassword: {
        subject: function () {
            return 'How to reset your password on ' + Accounts.emailTemplates.siteName;
        },
        text: function (user, url) {
            let url2 = url.replace('#/reset-password', 'resetpassword');
            let greeting = (user.profile && user.profile.name) ?
                ('Hello ' + user.profile.name + ',') : 'Hello,';
            return greeting + '\n' + '\n' + 'To reset your password, simply click the link below.\n' +
                '\n' + url2 + '\n' + '\n' + 'Thanks.\n';
        }
    },
    verifyEmail: {
        subject: function () {
            return 'Kaiam App verify email address on ' + Accounts.emailTemplates.siteName;
        },
        text: function (user, url) {
            let greeting = (user.profile && user.profile.name) ?
                ('Hello ' + user.profile.name + ',') : 'Hello,';
            return greeting + '\n' + '\n' + 'To verify your account email, simply click the link below.\n' +
                '\n' + url + '\n' + '\n' + 'Thanks.\n';
        }
    },
    enrollAccount: {
        subject: function () {
            return 'Kaiam App account has been created for you on ' + Accounts.emailTemplates.siteName;
        },
        text: function (user, url) {
            let greeting = (user.profile && user.profile.name) ?
                ('Hello ' + user.profile.name + ',') : 'Hello,';
            return greeting + '\n' + '\n' + 'To start using the service, simply click the link below.\n' +
                '\n' + url + '\n' + '\n' + 'Thanks.\n';
        }
    }
};
