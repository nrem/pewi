var HUDManager = function () {

    this.addHUDItem = function ($parent, content, opts) {
        var $content = $(content);
        if (opts) {
            if (opts.hasOwnProperty('right')) $content.css('right', 100);
            if (opts.hasOwnProperty('top')) $content.css('top', opts.top);
            if (opts.hasOwnProperty('left')) $content.css('left', opts.left);
            if (opts.hasOwnProperty('bottom')) $content.css('bottom', opts.bottom);
        }

        $parent.append(content);
    }
};
