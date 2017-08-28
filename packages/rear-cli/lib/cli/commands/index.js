'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.Commands=exports.CommandList=undefined;var _baseCommand=require('./base-command');var _run=require('./run');var _run2=_interopRequireDefault(_run);var _new=require('./new');var _new2=_interopRequireDefault(_new);var _help=require('./help');var _help2=_interopRequireDefault(_help);var _install=require('./install');var _install2=_interopRequireDefault(_install);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}const CommandList=exports.CommandList=[_run2.default,_new2.default,_help2.default,_install2.default].sort((a,b)=>a.name.localeCompare(b.name));const Commands=exports.Commands=new Map;var _iteratorNormalCompletion=true;var _didIteratorError=false;var _iteratorError=undefined;try{for(var _iterator=CommandList[Symbol.iterator](),_step;!(_iteratorNormalCompletion=(_step=_iterator.next()).done);_iteratorNormalCompletion=true){const command=_step.value;Commands.set(command.name,command);var _iteratorNormalCompletion2=true;var _didIteratorError2=false;var _iteratorError2=undefined;try{for(var _iterator2=command.aliases[Symbol.iterator](),_step2;!(_iteratorNormalCompletion2=(_step2=_iterator2.next()).done);_iteratorNormalCompletion2=true){const alias=_step2.value;Commands.set(alias,command)}}catch(err){_didIteratorError2=true;_iteratorError2=err}finally{try{if(!_iteratorNormalCompletion2&&_iterator2.return){_iterator2.return()}}finally{if(_didIteratorError2){throw _iteratorError2}}}}}catch(err){_didIteratorError=true;_iteratorError=err}finally{try{if(!_iteratorNormalCompletion&&_iterator.return){_iterator.return()}}finally{if(_didIteratorError){throw _iteratorError}}}exports.default=Commands;