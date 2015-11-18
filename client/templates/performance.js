var startDate = new Blaze.ReactiveVar();
var endDate = new Blaze.ReactiveVar();

Template.performance.rendered = function () {
    function cb(start, end) {
        var s = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');
        $('#reportrange span').html(s);
        console.log('Chosen: ' + s);
        console.log(start.toDate());
        console.log(end.toDate());
        console.log('');
        startDate.set(start.toDate());
        endDate.set(end.toDate());
    }
    cb(moment().subtract(29, 'days'), moment());

    $('#reportrange').daterangepicker({
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);
};

Template.performance.helpers({
    nTxns: function () {
        return Transactions.find({ date: { $gte: startDate.get(), $lte: endDate.get() } }).count();
    },
    totalMargin: function () {
        return 'made up';
    }
});
