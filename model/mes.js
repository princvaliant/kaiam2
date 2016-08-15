Mes = new Mongo.Collection('mes');
Mesroles = new Mongo.Collection('mesroles');
Mesvars = new Mongo.Collection('mesvars');
Mesparts = new Mongo.Collection('mesparts');
Mest = new Mongo.Collection('mest');
Mestroles = new Mongo.Collection('mestroles');
Mestvars = new Mongo.Collection('mestvars');
/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
_.each([Mes, Mesroles, Mesvars, Mesparts, Mest, Mestroles, Mestvars], (it) => {
    it.allow({
        insert: function () {
            return true;
        },
        update: function () {
            return true;
        },
        remove: function () {
            return true;
        }
    });
});

