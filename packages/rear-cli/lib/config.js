'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.Config=undefined;var _fsExtra=require('fs-extra');var _fsExtra2=_interopRequireDefault(_fsExtra);var _path=require('path');var _path2=_interopRequireDefault(_path);var _constants=require('./constants');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}const resolveApp=function(){return _path2.default.resolve(_fsExtra2.default.realpathSync(process.cwd()),_path2.default.join(...arguments))};const Config=exports.Config={binDir:resolveApp(_constants.NODE_MODULES,'.bin'),cwd:process.cwd()};exports.default=Config;