
window.MBO = {};

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


