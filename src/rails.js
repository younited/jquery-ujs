jQuery.fn.extend({
    /**
     * Triggers a custom event on an element and returns the event result
     * this is used so that we can catch the result and prevent a later action from occuring
     * 
     * TODO: needs a better name
     */
    triggerAndReturn: function (name, data) {
        var event = new jQuery.Event(name);
        this.trigger(event);

        return event.result !== false;
    },

    /**
     * Handles execution of remote calls firing overridable events along the way
     *
     */
    callRemote: function () {
        var el      = $(this),
            data    = [],
            method  = el.attr('method') || el.attr('data-method') || 'GET',
            url     = el.attr('action') || el.attr('href') || el.attr('data-url');

        if (el.context.tagName.toUpperCase() === 'FORM') {
            data = el.serializeArray();
        }

        // TODO: should let the developer know no url was found
        if (url !== undefined) {
            if (el.triggerAndReturn('ajax:before')) {
                $.ajax({
                    url: url,
                    data: data,
                    type: method.toUpperCase(),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Accept", "text/javascript");
                        el.trigger('ajax:loading', xhr);
                    },
                    success: function (data, status, xhr) {
                        el.trigger('ajax:success', [data, status, xhr]);
                    },
                    complete: function (xhr) {
                        el.trigger('ajax:complete', xhr);
                    },
                    error: function (xhr, status, error) {
                        el.trigger('ajax:failure', [xhr, status, error]);
                    }
                });
            }

            el.trigger('ajax:after');
        }
    }
});

jQuery(function ($) {

    /**
     * data-remote handlers
     */
    $('form[data-remote="true"]').live('submit', function () {
        $(this).callRemote();        
        return false;
    });

    $('a[data-remote="true"],input[data-remote="true"]').live('click', function () {
        $(this).callRemote();        
        return false;
    });
});