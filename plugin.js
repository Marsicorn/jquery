(function($) {

    let methods = {
        init: function(options) {
            return this.each(function() {
                let originalList = $(this).children();
                $(this).data('originalList', originalList);
                let taskAmount = originalList.length;

                const DEFAULTS = {
                    direction: 'up',
                    index: 0,
                    debug: false
                };

                $(this).unbind('click');
                let settings = $.extend({}, DEFAULTS, options);

                if (settings.index >= taskAmount) settings.index %= taskAmount;

                if (settings.direction === 'down') {
                    settings.index = taskAmount - 1 - settings.index;
                    console.log(settings.index);
                }

                $(this).on('click', function (event) {
                    if (event.target === this) return;
                    event.stopPropagation();

                    _move(event.target, settings.index, settings.debug);
                });
            });
        },

        revert: function() {
            $(this).empty().append(this.data('originalList'));
        },

        destroy: function() {
            return this.each(function() {
                $(this).unbind('.taskList');
                $(this).unbind('click');
            });
        }
    };

    function _move(elem, refElementIndex, debug) {
        elem = $(elem);

        let taskList = elem.parent().children();
        if ($(taskList).filter(':animated').length > 0)
            return;

        let elemIndex = elem.index();
        if (elemIndex == refElementIndex)
            return;

        let refElem =  $(taskList[refElementIndex]);

        let elemOuterHeight = elem.outerHeight();
        let scale = 1.1;

        let elemTranslation = refElem.position().top  - elem.position().top;
        let otherTranslation = elemOuterHeight/scale + parseInt(elem.css('margin'));

        let from;
        let to;

        if (elemIndex < refElementIndex) {
            elemTranslation += refElem.outerHeight() - elemOuterHeight*(1 - (scale - 1)/2);
            otherTranslation *=  -1;
            from = elemIndex + 1;
            to = refElementIndex;
        } else {
            elemTranslation -= elemOuterHeight*(scale - 1)/2;
            from = refElementIndex;
            to = elemIndex - 1;
        }

        elem.queue(function (next) {
            elem.css({position: 'relative'
                , zIndex: '2'
                , transform: 'scale(' + scale + ')'
            });
            elem
                .animate({"left": "100"}, 400)              //* alternative animation
                .animate({"top": elemTranslation}, 600)
                .animate({"left": "0"}, 400);               //*
            next();
        });

        let currentElem;
        for (let i = from; i <= to; i++) {
            currentElem = $(taskList[i]);
            currentElem.css({position: 'relative'});
            currentElem
                .delay(450)                                 //*
                .animate({"top": otherTranslation}, 500);
        }

        elem.queue(function (next) {
            if (elemIndex < refElementIndex)
                elem.insertAfter(refElem);
            else
                elem.insertBefore(refElem);
            elem.css({
                position: 'static'
                , 'top' : 0
                , 'left' : 0
                , zIndex: '1'
                , transform: ''
            });
            for (let i = from; i <= to; i++) {
                currentElem = $(taskList[i]);
                currentElem.css({
                    position: 'static'
                    , 'top' : 0
                });
            }
            next();
        });

        if (debug === 'true') {
            console.log('Current state:');
            let taskAmount = taskList.length;
            for (let i = 0; i < taskAmount; i++) {
                console.log(taskList[i]);
            }
        }
    }

    $.fn.taskList = function(method) {
        if(methods[method]) {
            return methods[method].apply(
                this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method == 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method' + method + 'doesn\'t exist');
        }
    };
})(jQuery);