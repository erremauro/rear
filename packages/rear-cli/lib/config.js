'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.Config=undefined;var _resolveApp=require('rear-core/resolve-app');var _resolveApp2=_interopRequireDefault(_resolveApp);var _constants=require('./constants');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}const Config=exports.Config={binDir:(0,_resolveApp2.default)(_constants.NODE_MODULES,'.bin'),cwd:process.cwd()};exports.default=Config;