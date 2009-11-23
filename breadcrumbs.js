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

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

window.MBO = {}; // global namespace

// Some library stuff, created mostly for fun

// Call @fun@ with @element@ and @i@
//
// Ex.
//   var sum = 0;
//   MBO.each([1,2,3], function(el) { sum += el });
//   # sum === 6
//
// Asign @this@ to @caller@
MBO.each = function each(collection, fun) {
    var i;
    for (i = 0; i < collection.length; i++) {
        fun.apply(each.caller, [collection[i], i]);
    }
};
// Call @fun@ with @element@ and @i@ and take add returned value
// to result collection
//
// Returns new collection containing results from calling @fun@
//
// Ex.
//   MBO.map([1,2,3], function(el) { return el * 2 });
//   #=> [2,4,6]
//
// Asign @this@ to @caller@
MBO.map = function map(collection, fun) {
    var i, result;
    result = []
    for (i = 0; i < collection.length; i++) {
        result.push(fun.apply(map.caller, [collection[i], i]));
    }
    return result;
};
// Call @fun@ with @element@ and @i@ and take only those elements from
// original collection, which @fun@ returned truthly value for
//
// Returns colleciton with values not filtered by fun
//
// Ex.
//   MBO.grep([1,2,3], function(el) { return el >= 2 });
//   #=> [2,3]
//
// Asigns @this@ to @caller@
MBO.grep = function grep(collection, fun) {
    var i, result, tmp;
    result = [];
    for (i = 0; i < collection.length; i++) {
        if (fun.apply(grep.caller, [collection[i], i])) {
            result.push(collection[i]);
        }
    }
    return result;
};
// Call @fun@ with @result@, @element@ and @i@ and take returend value
// as next result,
//
// Returns last result returned from func
//
// Ex.
//   MBO.reduce([1,2,3], 0, function(sum, el) { return sum + el });
//   #=> 6
//
// Asigns @this@ to @caller@
MBO.reduce = function reduce(collection, initial, fun) {
    var i, result;
    result = initial;
    for (i = 0; i < collection.length; i++) {
        result = fun.apply(reduce.caller, [result, collection[i], i]);
    }
    return result;
};


MBO.BREADCRUMB = { // namespace for project
    DAG : {
        mapOptions : function(optionsList, prefix) {
            var prefixRx,
                result,
                depth;

            prefixRx = new RegExp("^(?:" + prefix + ")*");
            result = MBO.map(optionsList, function(item) {
                return {
                    depth: ( prefixRx.exec(item.text)[0].length / prefix.length ),
                    value: item.value,
                    text: item.text.replace(prefixRx, "")
                };
            });
            return result;
        },
        reduceToDag : function(items) {
            var stack = [],
            dag = {};

            dag[""] = {item: {depth: -1}, childIds: []}; // root value
            stack.push(""); // guard value, poining to root with negative depth
            MBO.each(items, function(item) {
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
                var selected = Object.create(this);
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
            return Object.create(this.listPrototype).init(dag, onSelect);
        }
    },
    getDag : function(rootElement, prefix) {
        var dag = MBO.BREADCRUMB.DAG.getDag($(rootElement).find("option"), prefix);
        return dag;
    },
    getList : function(rootElement, prefix) {
        var dag = this.getDag(rootElement, prefix);
        var list = MBO.BREADCRUMB.LIST.create(dag, function(target, selected) { alert("target=" + target.value + ";\nselectedValue=" + selected + ";")});
        return list;
    }
};

