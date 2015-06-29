quantifier = {
    toNumber: function (obj) {
        return obj.kodi * 20 + obj.lusin * 12 + obj.potong;
    },

    toKodi: function (number) {
        return {
            kodi: Math.floor(number / 20),
            lusin: 0,
            potong: number % 20
        }
    },

    toLusin: function (number) {
        return {
            kodi: 0,
            lusin: Math.floor(number / 12),
            potong: number % 12
        }
    },

    toGroupingStr: function (number, grouping) {
        var obj;
        if (grouping == 'kodi') {
            obj = quantifier.toKodi(number);
            return obj.kodi + ' kodi ' + obj.potong + ' potong';
        } else if (grouping == 'lusin') {
            obj = quantifier.toLusin(number);
            return obj.lusin + ' lusin ' + obj.potong + ' potong';
        }
    }

};