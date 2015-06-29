Meteor.methods({
    pikachu: function(a, b) {
        console.log('a: ' + a);
        console.log('b: ' +b);
        return 'pikachu';
    },
    createStockReport: function() {
        var ret = [];
        Items.find({}).forEach(function (item) {
            var quantity = 0;

            Mutations.find({ itemId: item._id }).forEach(function (mutation) {
                quantity = quantity + mutation.quantity;
            });

            var q = quantifier.toGroupingStr(quantity, item.grouping);
            var price = item.price;
            var grouping;

            if (item.grouping == 'kodi') {
                grouping = 20;
            } else if (item.grouping == 'lusin') {
                grouping = 12;
            }

            var value = quantity / grouping * price;

            ret.push({ name: item.name, quantity: q, price: price, value: value })
        });

        return ret;
    }
});