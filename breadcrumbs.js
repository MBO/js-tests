/**
 * File:        breadcrumbs.js
 * Description: 
 * Author:      Mirosław Boruta <boruta.miroslaw gmail.com>
 * Licence:     This program is free software. It comes without any warranty,  
 *              to the extent permitted by applicable law. You can redistribute
 *              it and/or modify it under the terms of the Do What The Fuck You
 *              Want To Public License, Version 2, as published by Sam Hocevar.
 *              See http://sam.zoy.org/wtfpl/COPYING for more details.         
 */

window.MBO = {}; // global namespace

MBO.BREADCRUMB = { // namespace for project
    DAG : {
        mapOptions : function(optionsList, prefix) {
            var prefixRx,
                results,
                depth;

            prefixRx = new RegExp("^(?:" + prefix + ")*");
            results = $.map(optionsList, function(item) {
                return {
                    depth: ( prefixRx.exec(item.text)[0].length / prefix.length ),
                    value: item.value,
                    text: item.text.replace(prefixRx, "")
                };
            });
            return results;
        },
        reduceToDag : function(items) {
            var stack = [],
                dag = {};

            dag[""] = {item: {depth: -1}, childIds: []}; // root value
            stack.push(""); // guard value, poining to root with negative depth
            $.each(items, function(i,item) {
                if (item.value.length) { // skip empty value ("")
                    dag[item.value] = {item: item, childIds: []};
                    while (stack.length > 0 &&
                        dag[ stack[ stack.length-1 ] ].item.depth >= item.depth) {
                        stack.pop();
                    }
                    if (stack.length) {
                        dag[ stack[ stack.length-1 ] ].childIds.push(item.value);
                    }
                    stack.push(item.value);
                }
            });
            return dag;
        },
        getDag : function(optionsList, prefix) {
            return this.reduceToDag(this.mapOptions(optionsList, prefix));
        }
    },
    LIST : {
        listPrototype : {
            init : function(dag, onSelect) { // only for head!!!
                this.dag = dag;
                this.onSelect = onSelect || function(){};
                this.value = "";
                this.childIds = dag[""].childIds;
                this.selected = null;
                return this;
            },
            newSelected: function(selectedValue) {
                var selected = $.extend({}, this);
                selected.value = selectedValue;
                selected.childIds = this.dag[selectedValue].childIds;
                selected.selected = null;
                selected.parent = this;
                return selected;
            },
            select : function(selectedValue) { // select value (not check if actual from childIds!) and create new selected
                if (selectedValue !== undefined && selectedValue !== "") {
                    this.selected = this.newSelected(selectedValue);
                    this.onSelect(this, selectedValue);
                } else {
                    this.selected = null;
                    if (this.parent) {
                        this.parent.select(this.value);
                    } else {
                        this.onSelect(this, selectedValue);
                    }
                }
            }
        },
        create : function(dag, onSelect) {
            return $.extend({}, this.listPrototype).init(dag, onSelect);
        }
    },
    getDag : function(rootElement, prefix) {
        var dag = MBO.BREADCRUMB.DAG.getDag($.find("option", rootElement), prefix);
        return dag;
    },
    getList : function(rootElement, prefix, onSelect) {
        var dag = this.getDag(rootElement, prefix);
        var list = MBO.BREADCRUMB.LIST.create(dag, onSelect);
        return list;
    }
};

