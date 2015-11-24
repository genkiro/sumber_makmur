var startDate = new Blaze.ReactiveVar();
var endDate = new Blaze.ReactiveVar();

var nSale = new Blaze.ReactiveVar();
var totRevenue = new Blaze.ReactiveVar();
var totBuyingPrice = new Blaze.ReactiveVar();
var totMargin = new Blaze.ReactiveVar();
var totMarginPerc = new Blaze.ReactiveVar();
var totDelayCost = new Blaze.ReactiveVar();
var totProfitBeforeCost = new Blaze.ReactiveVar();
var mutations = new Blaze.ReactiveVar();

Template.performance.rendered = function () {
    function cb(start, end) {
        nSale.set('loading..');
        totRevenue.set('loading..');
        totBuyingPrice.set('loading..');
        totMargin.set('loading..');
        totMarginPerc.set('loading..');
        mutations.set([]);

        var s = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');
        $('#reportrange span').html(s);

        startDate.set(start.toDate());
        endDate.set(end.toDate());

        Meteor.call('performance', start.toDate(), end.toDate(), function (err, result) {
            nSale.set(result.nSale);
            totRevenue.set(result.totRevenue);
            totBuyingPrice.set(result.totBuyingPrice);
            totMargin.set(result.totMargin);
            totMarginPerc.set(result.totMarginPerc);
            totDelayCost.set(result.totDelayCost);
            totProfitBeforeCost.set(result.totProfitBeforeCost);
            mutations.set(result.mutations);
        });
    }
    cb(moment().subtract(29, 'days'), moment());

    $('#reportrange').daterangepicker({
        ranges: {
            'Kemarin': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '7 Hari Terakhir': [moment().subtract(6, 'days'), moment()],
            '30 Hari Terakhir': [moment().subtract(29, 'days'), moment()],
            'Minggu Ini': [moment().startOf('week'), moment().endOf('week')],
            'Minggu Lalu': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
            'Bulan Ini': [moment().startOf('month'), moment().endOf('month')],
            'Bulan Lalu': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);
};

Template.performance.helpers({
    o: function () {
        return {
            nSale: nSale.get(),
            totRevenue: totRevenue.get(),
            totBuyingPrice: totBuyingPrice.get(),
            totMargin: totMargin.get(),
            totMarginPerc: totMarginPerc.get(),
            totDelayCost: totDelayCost.get(),
            totProfitBeforeCost: totProfitBeforeCost.get(),
            mutations: mutations.get()
        };
    }
});
