/**
 * File:        application.js
 * Description:
 * Author:      Mirosław Boruta <boruta.miroslaw gmail.com>
 * Licence:     This program is free software. It comes without any warranty,  
 *              to the extent permitted by applicable law. You can redistribute
 *              it and/or modify it under the terms of the Do What The Fuck You
 *              Want To Public License, Version 2, as published by Sam Hocevar.
 *              See http://sam.zoy.org/wtfpl/COPYING for more details.         
 * Dependency:  jQuery global object
 */

// quick fix for Opera not having console.log() function
if (!window.console) {
    window.console = {log: (opera ? opera.postError : alert)};
}
(function($){
    var log = {
        init: function (rootEl) {
            var that = this;
            this.preEl = $("<pre/>").appendTo(rootEl);
            this.preEl.clear = function() { this.html(""); };
            this.preEl.log   = function(msg) { this.append("[" + Date() + "] <em>" + msg + "</em>\n"); };
            $("<button/>").
                appendTo(rootEl).text("Clear").
                bind("click", function(){ that.preEl.clear(); });

            return this;
        },
        log: function (msg) {
            this.preEl.log(msg);
            console.log(msg);
            return this;
        }
    };

    log.init("#log").log("Starting...");

    var selectListProto = {
        init: function(params) {
            var dag,that = this;

            dag  = MBO.BREADCRUMB.DAG.getDag(params.optionElements, params.prefix);
            this.list = MBO.BREADCRUMB.LIST.create(dag, function() { that.onSelect.apply(that, arguments); });

            this.outEl = params.outputHolder;
            this.outEl.bind("change", function(ev) {
                $(ev.target).data("sublist").select(ev.target.value);
                that.regenerateSelects();
            });
            this.idEl = params.idHolder;
            this.regenerateSelects();
        },
        onSelect: function(target, selected) {
            this.idEl.val(selected);
        },
        clear: function() {
            this.outEl.html("");
            return this;
        },
        generateSelects: function() {
            var sublist,select,i,id,option,that = this;
            log.log("Generaging selects...").log(this.list);
            for (sublist = this.list; sublist; sublist = sublist.selected) {
                if (sublist.childIds.length) {
                    select = $("<select/>").appendTo(this.outEl).data("sublist", sublist);
                    $("<option/>").appendTo(select);
                    for (i = 0; i < sublist.childIds.length; i++) {
                        id = sublist.childIds[i];
                        $("<option/>").appendTo(select).val(id).text(sublist.dag[id].item.text);
                    }
                    select.val(sublist.selected && sublist.selected.value);
                }
            }
            log.log("Done generating selects");
            return this;
        },
        regenerateSelects: function() {
            return this.clear().generateSelects();
        }
    };

    //selectList.init($("select").find("option"), "-", $("#out"));
    ss = Object.create(selectListProto);
    ss.init({
        optionElements: $("select").find("option"),
        prefix: "-",
        outputHolder: $("#out"),
        idHolder: $("#id")
    });

    $(function() {
    });
})(jQuery);

