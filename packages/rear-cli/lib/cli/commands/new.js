'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _baseCommand=require('./base-command');var _baseCommand2=_interopRequireDefault(_baseCommand);var _appInstaller=require('../../operators/app-installer');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}class NewCommand extends _baseCommand2.default{constructor(){super({name:'new',usage:'<project-name>',description:'Create a new rear project'})}commandWillRun(){this.command.option('-t, --system-type [type]','use the given system template [package]','package');this.command.option('-r, --release [version]','use the specified system template release [latest]');this.command.option('-v, --verbose','print additional logs');this.command.arguments('<project-name>');this.command.action(projectName=>{this.state.projectName=projectName})}async commandDidRun(args){const projectName=this.state.projectName;if(projectName){return(0,_appInstaller.createApp)({appName:projectName,dependencies:['rear-core'],systemType:this.command.systemType,version:this.command.release,reporter:this.reporter})}return Promise.resolve()}printHelp(){const reporter=this.reporter;reporter.log();reporter.highlight('  Examples:');reporter.log();reporter.log('    %crear new my-app -t client%c\tCreate a new rear client in %c./my-app','cyan','reset','green');reporter.log()}}const newCommand=new NewCommand;exports.default=newCommand;