var Background = function() {
    this.draw = function(options) {
        var image = d3.select(options.parent)
            .append('svg:image')
            .attr('x', options.x)
            .attr('y', options.y)
            .attr('width', options.width)
            .attr('height', options.height)
            .attr('xlink:href', options.file);
    };
};
