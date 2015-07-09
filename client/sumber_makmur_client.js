// counter starts at 0
console.log('client file');

// load a language
numeral.language('id', {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'ribu',
        million: 'juta',
        billion: 'milyar',
        trillion: 'trilliun'
    },
    currency: {
        symbol: 'Rp. '
    }
});

// switch between languages
numeral.language('id');

Session.setDefault('counter', 0);

var rupiahStr = function (n) {
    return numeral(n).format('$ 0,0[.]00');
};

$.each({
    chain: function () {
        var helpers = [], value;
        $.each(arguments, function (i, arg) {
            if (Handlebars.helpers[arg]) {
                helpers.push(Handlebars.helpers[arg]);
            } else {
                value = arg;
                $.each(helpers, function (j, helper) {
                    value = helper(value, arguments[i + 1]);
                });
                return false;
            }
        });
        return value;
    },
    dozenInPieces: function(inDozen) {
        return Math.round(inDozen / 12);
    },
    dateStringOf: function (m) {
        return m.toDateString();
    },
    rupiah: rupiahStr
}, function ( name, handler ) {
    Handlebars.registerHelper( name, handler );
});

var retrieveItemNames = function () {
    var arr = [];
    Items.find({}).forEach(function (x) { arr.push(x.name); });
    return arr;
};

/**
 * Defining behaviors of input pages (Brg Masuk, Brg Keluar).
 *
 * @param direction 1 if items are coming in, -1 if items are coming out.
 * @returns {{click #addRow: Function, click .removeRow: Function, submit form: Function}}
 */
var inputPageBehaviours = function(direction) {
    return {
        'click #addRow': function (e) {
            e.preventDefault();
            $(e.target).closest('tr').before('<tr class="field"><td class="col-md-4"><input type="text" class="form-control typeahead itemName" placeholder="Handuk KH 101" data-source="items"></td><td class="col-md-1"><div class="input-group"><input type="text" class="form-control itemQuantity kodi" placeholder="50"><div class="input-group-addon">kodi</div></div></td><td class="col-md-1"><div class="input-group"><input type="text" class="form-control itemQuantity lusin" placeholder="70"><div class="input-group-addon">lusin</div></div></td><td class="col-md-1"><div class="input-group"><input type="text" class="form-control itemQuantity potong" placeholder="0"><div class="input-group-addon">potong</div></div></td><td class="col-md-1"><button class="btn btn-danger removeRow"><span class="glyphicon glyphicon-remove"></span></button></td></tr>');
            $('.typeahead').typeahead({source: retrieveItemNames(), autoSelect: true});
            $('.itemQuantity').inputmask("integer");
        },
        'click .removeRow': function (e) {
            e.preventDefault();

            var tr = $(e.target).closest('tr');

            // if the rows left are only the heading and the + button, prevent removal
            if (tr.siblings('tr').length == 2) {
                return;
            }

            tr.remove();
        },
        'submit form': function (e) {
            e.preventDefault();
            var hasError = false;
            var hasEmptyField = false;

            var $date = $('#date');
            var $who = $('#who');
            var $invoice = $('#invoice');
            var $trField = $('tr.field');

            if ($date.val() == '') { hasEmptyField = true; }
            if ($who.val() == '') { hasEmptyField = true; }
            if ($invoice.val() == '') { hasEmptyField = true; }

            $trField.each(function (index, el) {
                var name = $(el).find('.itemName').val();
                var quantity = $(el).find('.itemQuantity').val();

                if ($(el).find('.itemName').val() == '') { hasEmptyField = true; }

                var filledQuantityField = $(el).find('.itemQuantity').filter(function (i, el) { return $(el).val() != ''; });
                if ((filledQuantityField).length == 0) { hasEmptyField = true; }
            });

            if (hasEmptyField) {
                alertify.error('Ada field yang kosong');
                hasError = true;
            }

            var notFound = $(e.target).find('.itemName').filter(function (i, el) {
                if (el.value == '') { return false; }
                return !Items.findOne({name: el.value});
            });

            if (notFound.length > 0) {
                alertify.error('Barang2 ini belum terdaftar: ' + notFound.map(function (k, v) {
                    return v.value;
                }));
                hasError = true;
            }

            if (hasError) {
                return;
            }

            var txnId = Transactions.insert({ date: $('.tanggal').datepicker('getDate'), invoiceNo: $invoice.val(), who: $who.val() });

            $trField.each(function (index, el) {
                var name = $(el).find('.itemName').val();

                var kodi = Number($(el).find('.kodi').val());
                var lusin = Number($(el).find('.lusin').val());
                var potong = Number($(el).find('.potong').val());

                var quantity = quantifier.toNumber({ kodi: kodi, lusin: lusin, potong: potong });
                var item = Items.findOne({name: name});

                Mutations.insert({itemId: item._id, txnId: txnId, quantity: direction * quantity});

                return name;
            });

            alertify.success('Sip, sudah tercatat.');
            $('input.form-control:not(.tanggal)').val('');
            $('.removeRow').click();
        }
    }
};

Template.inboundForm.events(inputPageBehaviours(1));

Template.inboundForm.rendered = function () {
    bindDates();
    $('.typeahead').typeahead({ source: retrieveItemNames(), autoSelect: true });
    $('.itemQuantity').inputmask("integer");
};

Template.inboundForm.helpers({
    items: function() {
        return Items.find().fetch().map(function(item){ return item.name; });
    }
});

Template.outboundForm.events(inputPageBehaviours(-1));

Template.outboundForm.rendered = function () {
    bindDates();
    $('.typeahead').typeahead({ source: retrieveItemNames(), autoSelect: true });
    $('.itemQuantity').inputmask("integer");
};

Template.itemList.rendered = function () {
    $('.itemPrice').inputmask("integer", { autoGroup: true, groupSeparator: " ", groupSize: 3 });
};

Template.itemList.helpers({
    items: function () {
        return Items.find({}/*, {sort: {name: 1}}*/);
    }
});

Template.itemList.events({
    'click #addItem': function(e) {
        e.preventDefault();

        var parent = $(e.target).closest('tr');
        var nameField = parent.find('.itemName');
        var priceField = parent.find('.itemPrice');
        var groupingField = parent.find('.itemGrouping');

        Items.insert({ name: nameField.val(), price: Number(priceField.inputmask('unmaskedvalue')), grouping: groupingField.val() });

        nameField.val('');
        priceField.val('');
    }
});

Template.item.helpers({
    /**
     * Return the Rupiah formatted price of one item, provided: price of a certain grouping.
     * @param price
     * @param grouping
     * @returns {*}
     */
    rupiahPerOneItem: function (price, grouping) {
        var ret;
        if (grouping == 'kodi') {
            ret = price / 20;
        } else if (grouping == 'lusin') {
            ret = price / 12;
        } else if (grouping == 'potong') {
            ret = price;
        }

        return numeral(Math.round(ret)).format('$ 0,0[.]00');
    }
});

Template.item.events({
    'click .deleteItem': function(e) {
        e.preventDefault();

        var parent = $(e.target).closest('tr');
        var item = Items.findOne({_id: parent.data('id')});

        alertify.confirm('Yakin mau hapus "' + item.name + '" ?',
            function() {
                Items.remove({_id: parent.data('id')}, function (err) { alertify.success('Terhapus'); });
            },
            function() { }
        );
    },
    'click .editItemName': function(e) {
        e.preventDefault();

        var parent = $(e.target).closest('tr');
        var itemId = parent.data('id');
        var item = Items.findOne({_id: itemId});
        var oldName = item.name;

        alertify.prompt('Ubah nama "' + oldName + '" menjadi apa?', oldName,
          function (evt, newName) {
            Items.update({ _id: itemId }, { $set: { name: newName }}, function () {
                alertify.success('Nama "' + oldName + '" terubah menjadi "'  + newName + '"');
            });
          },
          function () {
            alertify.error('Cancel');
          })
        ;
    },
    'click .editItemPrice': function(e) {
        e.preventDefault();

        var parent = $(e.target).closest('tr');
        var itemId = parent.data('id');
        var item = Items.findOne({_id: itemId});
        var oldPrice = item.price;

        alertify.prompt('Ubah harga brg "' + item.name + '" dr ' + rupiahStr(oldPrice) + ' menjadi berapa Rupiah per ' + item.grouping + '?', oldPrice,
          function (evt, newPrice) {
            Items.update({ _id: itemId }, { $set: { price: newPrice }}, function () {
                alertify.success('Harga brg "' + item.name + '" terubah dr ' + rupiahStr(oldPrice) + ' menjadi ' + rupiahStr(newPrice) + ' per ' + item.grouping);
            });
          },
          function () {
            alertify.error('Cancel');
          })
        ;
    }
});

Template.stock.rendered = function() {
    var $tbody = $('tbody');
    var $input = $('input.typeahead');
    $input.typeahead({ source: retrieveItemNames(), autoSelect: true });
    $input.on('input propertychange paste change', function(e) {
        $tbody.empty();
        var item = Items.findOne({name: e.target.value});
        if (!item) {
            $tbody.append('<h3>Tidak ada barang bernama: ' + e.target.value + '</h3>');
            return;
        }
        var itemId = item._id;
        var grouping = item.grouping;
        var sum = 0;
        Mutations.find({ itemId: itemId }).forEach(function(mutation) {
            var q = mutation.quantity;
            var txn = Transactions.findOne({ _id: mutation.txnId });
            sum = sum + q;
            var qDisp = quantifier.toGroupingStr(Math.abs(q), grouping);
            $tbody.append('<tr data-mutation-id="' + mutation._id + '"><td>' + txn.invoiceNo + '</td><td>' + txn.who + '</td><td>' + (q > 0 ? qDisp : '') + '</td><td>' + (q < 0 ? qDisp : '') + '</td><td>' + quantifier.toGroupingStr(sum, grouping) + '</td></tr>');
        });
    });
};


Template.stockReport.rendered = function() {
    Meteor.call('createStockReport', function (error, result) {
        var total = 0;
        result.forEach(function (x) {
            $('tbody').append('<tr><td>' + x.name + '</td><td>' + x.quantity + '</td><td>' + rupiahStr(x.price) + ' per ' + x.groupingName + '</td><td class="text-right">' + rupiahStr(x.value) + '</td></tr>');
            total = total + x.value;
        });
        $('tbody').append('<tr><td></td><td></td><td></td><td class="text-right"><strong>Total: </strong>' + rupiahStr(total) + '</td></tr>');
    });
};

Template.transactions.helpers({
    transactions: function() {
        return Transactions.find({});
    }
});

Template.transactions.events({
    'click .txnInfo': function (e) {
        e.preventDefault();
        $(e.target).popover({placement: 'bottom', trigger: 'focus', html: true, content: function () {
            var txnId = $(this).closest('tr').data('txnId');
            var ret = '<table class="table table-hover"><thead><tr><th>Nama Brg</th><th>Masuk</th><th>Keluar</th></tr></thead><tbody>';

            Mutations.find({ txnId: txnId }).forEach(function (mutation) {
                var q = mutation.quantity;
                var item = Items.findOne({_id: mutation.itemId});
                var qDisp = quantifier.toGroupingStr(Math.abs(q), item.grouping);

                var row = '<tr><td>' + item.name + '</td>' +
                    (q > 0 ? '<td>' + qDisp + '</td><td></td>' : '<td></td><td>' + qDisp + '</td>')
                    +'</tr>';

                ret = ret + row;
            });

            ret = ret + '</tbody></table>';

            return ret;
        }});
    }
});

Template.transaction.events({
    'click .deleteTxn': function (e) {
        var txnId = $(e.target).closest('tr').data('txnId');
        var txn = Transactions.findOne({ _id: txnId });

        alertify.confirm('Yakin mau hapus transaksi dengan "' + txn.who + '" nomer bon / nota: "' + txn.invoiceNo + '" tanggal: "' + txn.date.toDateString() + '" ?',
            function() {
                var mutationIds = Mutations.find({ txnId: txnId }).map(function (mutation) { return mutation._id; });
                mutationIds.forEach(function (mutationId) {
                    Mutations.remove({ _id: mutationId });
                });
                Transactions.remove({ _id: txnId }, function () { alertify.success('Terhapus'); } );
            },
            function() { }
        );
    }
});

var bindDates = function() {
    var dateFields = $('.tanggal');

    dateFields.datepicker({
        format: "dd MM yyyy",
        todayBtn: "linked",
        clearBtn: true,
        language: "id",
        daysOfWeekDisabled: "0",
        autoclose: true,
        todayHighlight: true,
        toggleActive: true
    });

    dateFields.datepicker('update', new Date());
};

