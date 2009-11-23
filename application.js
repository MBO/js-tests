if (!window.console) {
    window.console = {log: opera.postError};
}
(function($){
    var log = {
        init: function (rootEl) {
            var that = this;
            this.preEl = $("<pre/>").appendTo(rootEl);
            $("<button/>").appendTo(rootEl).text("Clear").bind("click", function(){that.preEl.html("")});
            return this;
        },
        log: function (msg) {
            this.preEl.append("[" + Date() + "] <em>" + msg + "</em>\n");
            console.log(msg);
            return this;
        }
    };

    log.init("#log").log("Starting...");

    var selectList = {
        init: function(rootEl, prefix, outEl, idEl) {
            var that = this;

            this.dag  = MBO.BREADCRUMB.DAG.getDag(rootEl, prefix);
            log.log(this.dag);

            this.list = MBO.BREADCRUMB.LIST.create(this.dag, function() { that.onSelect.apply(that, arguments); });
            log.log(this.list);

            this.outEl = outEl;
            this.idEl = idEl;
            this.regenerateSelects();
        },
        onSelect: function(target, selected) {
            log.log("selected").log(arguments);
            this.idEl.val(selected);
        },
        clear: function() {
            log.log("Clearing outEl");
            this.outEl.html("");
            return this;
        },
        generateSelects: function() {
            var i,j,that = this;
            log.log("Generaging selects...").log(this.list);
            for (i = this.list; i; i = i.selected) {
                if (i.childIds && i.childIds.length > 0) {
                    var select = $("<select/>");
                    log.log("Generating &lt;select/&gt; for sublist").log(i);

                    log.log("Generaging options for select");
                    $("<option/>").appendTo(select);
                    for (j = 0; j < i.childIds.length; j++) {
                        var id = i.childIds[j];
                        //log.log("    creating &lt;option/&gt; for id="+id);
                        var option = $("<option/>").appendTo(select).val(id).text(i.dag[id].item.text);
                        if (i.selected && i.selected.value === id) {
                            option.attr("selected", "selected");
                        }
                    }
                }
                select.appendTo(this.outEl);
                select.bind("change", (function(s,sublist) {
                    return function() {
                        sublist.select(s.val());
                        that.regenerateSelects();
                    }
                })(select,i));
            }
            log.log("Done generating selects");
            return this;
        },
        regenerateSelects: function() {
            return this.clear().generateSelects();
        }
    };

    //selectList.init($("select").find("option"), "-", $("#out"));
    ss = Object.create(selectList);
    ss.init($("select").find("option"), "-", $("#out"), $("#id"));

    $(function() {
    });
})(jQuery);

