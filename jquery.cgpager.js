(function ($) {

$.widget("ui.cgpager", {
    options: {
        'page': 1,
        'pageSize': 10,
        'url': null,
        'extraRequestData': null,
        'resultWrapperTag': "<li/>",
        'reloadStart': null,
        'reloadSuccess': null,
        'minLoadingHeight': 40
    },

    _create: function() {
        var self = this, o = self.options;

        var loading = $('<div/>', { 'class': 'cgpager-loading' }).hide();

        self.container = self.element.find('.cgpager-results-container');
        self.container.before(loading);
        self.results = self.element.find('.cgpager-results');
        self.loading = self.element.find('.cgpager-loading');
        self.pager = self.element.find('.cgpager-pager');

        self.reload();
    },
    
    reload: function() {
        var self = this, o = self.options;

        var containerHeight = self.container.outerHeight(true);
        containerHeight = containerHeight < o.minLoadingHeight ? o.minLoadingHeight : containerHeight;

        self.loading.height(containerHeight);

        // Hide any old/existing results and show the loading div
        self.container.hide();
        self.loading.show();

        self._trigger('reloadStart');

        // Load the paged results from the given URL
        $.ajax({
            'cache': false,
            'url': o.url,
            'data': $.extend({ 'pageSize': o.pageSize, 'currentPage': o.page }, o.extraRequestData),
            'dataType': 'json',
            'success': function (data) {
                self._buildPager(data.totalCount);
                self._populateResults(data.results);

                self.loading.hide();
                self.container.show();    

                self._trigger('reloadSuccess', null, data);
            }
        });
    },

    next: function() {
        var self = this, o = self.options;

        self._setOption('page', o.page + 1);
    },

    prev: function() {
        var self = this, o = self.options;

        self._setOption('page', o.page == 1 ? 1 : o.page - 1);
    },

    _setOption: function(key, value) {
        $.Widget.prototype._setOption.apply(this, arguments);

        // Reload when any of the options are changed
        this.reload();
    },

    _buildPager: function(totalCount) {
        var self = this, o = self.options;

        // Calculate the total number of pages
        var numPages = Math.ceil(totalCount / o.pageSize);

        // Build the list of page links
        var list = $('<ol/>');
        for (var i = 1; i <= numPages; i++) {
            var li = $('<li/>', { 'class': o.page == i ? "current" : "" });
            var link = $('<a/>', { 'href': '#', 'rel': i, 'text': i });
            li.append(link);
            list.append(li);
        }

        // Build the prev/next buttons
        var prev = $('<a/>', { 'class': 'prev', 'href': '#', 'rel': (o.page)*1 - 1, 'text': "Prev" });
        var next = $('<a/>', { 'class': 'next', 'href': '#', 'rel': (o.page)*1 + 1, 'text': "Next" });

        // Make sure prev button is hidden if at first page and next button is hidden at last page
        prev.attr('rel') <= 0 ? prev.hide() : prev.show();
        next.attr('rel') > numPages ? next.hide() : next.show();

        // Clear out the pager div and add the new pager
        self.pager.empty();
        self.pager.append(prev);
        self.pager.append(list);
        self.pager.append(next);

        // Create onclick event for the pager links
        $('a', self.pager).click(function(e) {
            e.preventDefault();
            self._setOption('page', $(this).attr('rel'));
        });
    },

    _populateResults: function(results) {
        var self = this, o = self.options;

        // Clear out any existing results
        self.results.empty();

        // Loop through the results and add them to the container
        for (var i = 0; i < results.length; i++) {
            var item = $(o.resultWrapperTag, { 'class': i % 2 == 0 ? 'even' : 'odd' });

            if (i == results.length - 1)
                item.addClass('last');

            item.html(results[i]);
            self.results.append(item);
        }
    }
});

})(jQuery);