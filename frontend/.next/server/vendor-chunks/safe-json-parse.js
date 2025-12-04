/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/safe-json-parse";
exports.ids = ["vendor-chunks/safe-json-parse"];
exports.modules = {

/***/ "(ssr)/./node_modules/safe-json-parse/tuple.js":
/*!***********************************************!*\
  !*** ./node_modules/safe-json-parse/tuple.js ***!
  \***********************************************/
/***/ ((module) => {

eval("module.exports = SafeParseTuple\n\nfunction SafeParseTuple(obj, reviver) {\n    var json\n    var error = null\n\n    try {\n        json = JSON.parse(obj, reviver)\n    } catch (err) {\n        error = err\n    }\n\n    return [error, json]\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvc2FmZS1qc29uLXBhcnNlL3R1cGxlLmpzIiwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2JpdGUtc2l6ZWQtbGVhcm5pbmctZnJvbnRlbmQvLi9ub2RlX21vZHVsZXMvc2FmZS1qc29uLXBhcnNlL3R1cGxlLmpzPzdjYTkiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBTYWZlUGFyc2VUdXBsZVxuXG5mdW5jdGlvbiBTYWZlUGFyc2VUdXBsZShvYmosIHJldml2ZXIpIHtcbiAgICB2YXIganNvblxuICAgIHZhciBlcnJvciA9IG51bGxcblxuICAgIHRyeSB7XG4gICAgICAgIGpzb24gPSBKU09OLnBhcnNlKG9iaiwgcmV2aXZlcilcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZXJyb3IgPSBlcnJcbiAgICB9XG5cbiAgICByZXR1cm4gW2Vycm9yLCBqc29uXVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/safe-json-parse/tuple.js\n");

/***/ })

};
;