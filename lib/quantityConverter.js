quantifier = {
    quantityOf: function (grouping) {
        if (grouping == 'kodi') {
            return 20;
        } else if (grouping == 'lusin') {
            return 12;
        } else if (grouping == 'potong') {
            return 1;
        }
    },

    toNumber: function (obj) {
        return obj.kodi * 20 + obj.lusin * 12 + obj.potong;
    },

    toKodi: function (number) {
        return {
            kodi: Math.floor(number / 20),
            lusin: 0,
            potong: number % 20
        };
    },

    toLusin: function (number) {
        return {
            kodi: 0,
            lusin: Math.floor(number / 12),
            potong: number % 12
        };
    },

    toPotong: function (number) {
        return {
            kodi: 0,
            lusin: 0,
            potong: number
        };
    },

    toGroupingStr: function (number, grouping) {
        var obj;
        if (grouping == 'kodi') {
            obj = quantifier.toKodi(number);
            return obj.kodi + ' kodi ' + obj.potong + ' potong';
        } else if (grouping == 'lusin') {
            obj = quantifier.toLusin(number);
            return obj.lusin + ' lusin ' + obj.potong + ' potong';
        } else if (grouping == 'potong') {
            obj = quantifier.toPotong(number);
            return obj.potong + ' potong';
        }
    }

};