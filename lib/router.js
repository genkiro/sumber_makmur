Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', {name: 'homepage'});
Router.route('/inboundForm', {name: 'inboundForm'});
Router.route('/outboundForm', {name: 'outboundForm'});
Router.route('/transactions', {name: 'transactions'});
Router.route('/stock', {name: 'stock'});
Router.route('/itemList', {name: 'itemList'});
Router.route('/stockReport', {name: 'stockReport'});
Router.route('/performance', {name: 'performance'})