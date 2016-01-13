Meteor.methods({
    pikachu: function(a, b) {
        console.log('a: ' + a);
        console.log('b: ' +b);
        return 'pikachu';
    },
    createStockReport: function() {
        var d = []; // key = itemId, value = quantity in our stock

        Mutations.find().forEach(function (mutation) {
            var record = d[mutation.itemId];
            var q = Number(mutation.quantity);
            d[mutation.itemId] = record ? Number(record + q) : q;
        });

        var ret = [];
        Items.find({}, {sort: {name: 1}}).forEach(function (item) {
            var quantity = d[item._id] ? d[item._id] : 0;

            var q = quantifier.toGroupingStr(quantity, item.grouping);
            var price = item.price;
            var grouping = quantifier.quantityOf(item.grouping);
            var value = quantity / grouping * price;

            ret.push({ name: item.name, quantity: q, price: price, groupingName: item.grouping, value: value });
        });

        return ret;
    },
    performance: function (start, end) {
        var txns = Transactions.find({ date: { $gte: start, $lte: end } });
        var txnIds = _.map(txns.fetch(), function (x) { return x._id; });

        // Collect only the outbound transactions with info of how much (Rp) they were sold for
        var sales = Mutations.find({txnId: { $in: txnIds }, soldFor: { $gt: 0 }});

        var totRevenue = 0;
        var totBuyingPrice = 0;
        var totDelayCost = 0;

        _.each(sales.fetch(), function (s) {
            var item = Items.findOne({ _id: s.itemId });

            var soldForPerPiece = s.soldFor / quantifier.quantityOf(s.soldForGrouping);
            var boughtForPerPiece = item.price / quantifier.quantityOf(item.grouping);
            var sellingPrice = soldForPerPiece * -s.quantity;
            var buyingPrice = boughtForPerPiece * -s.quantity;

            totRevenue += sellingPrice;
            totBuyingPrice += buyingPrice;

            var txn = Transactions.findOne({ _id: s.txnId });

            if (typeof txn.paymentDelay === 'undefined' || txn.paymentDelay === '-') {
                return;
            }

            // Assume that we always pay to supplier in 45 days. And debt rate is about 1.4%
            var delayToSupplier = 45;
            var interestRate = 0.014;
            var delaySuffered = Number(txn.paymentDelay) - delayToSupplier;

            totDelayCost += delaySuffered * interestRate / 30 * buyingPrice;
        });

        var totMargin = totRevenue - totBuyingPrice;
        var totProfitBeforeCost = totMargin - totDelayCost;

        return {
            nSale: sales.count(),
            totRevenue: totRevenue,
            totBuyingPrice: totBuyingPrice,
            totMargin: totMargin,
            totMarginPerc: (totMargin * 100 / totRevenue).toFixed(2),
            totDelayCost: totDelayCost,
            totProfitBeforeCost: totProfitBeforeCost,
            totProfitBeforeCostPerc: (totProfitBeforeCost * 100 / totRevenue).toFixed(2),
            mutations: [{
                date: new Date(),
                soldTo: 'Kwee Siang ps atom',
                itemName: 'Handuk pikachu',
                buyPrice: 272000,
                buyGrouping: 'lusin',
                sellPrice: 285000,
                sellGrouping: 'lusin',
                paymentDelay: 30,
                margin: 38.45
            }, {
                date: new Date(),
                soldTo: 'Piala Kapasan',
                itemName: 'Selimut charmander',
                buyPrice: 560000,
                buyGrouping: 'kodi',
                sellPrice: 600000,
                sellGrouping: 'kodi',
                paymentDelay: 45,
                margin: 11.23
            }]
        };

    }
});