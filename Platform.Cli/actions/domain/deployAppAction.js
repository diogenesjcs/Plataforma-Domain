const fs = require("fs");
const BuildAppAction = require("./buildAppAction");
const CompileAppAction = require("./compileAppAction");
const DockerService = require("../../services/docker");
const PortsService = require("../../services/ports");
const shell = require("shelljs");
const os = require("os");
const InstalledAppCore = require("plataforma-sdk/services/api-core/installedApp");
const DomainModelCore = require("plataforma-sdk/services/api-core/domainModel");
const System = require("plataforma-sdk/services/api-core/system");
const BaseDeployAction = require("../baseDeployAction");
const uuid = require("uuid/v4");
var yaml = require('js-yaml');

module.exports = class DeployAppAction extends BaseDeployAction {
    constructor(appInstance) {
        super();
        this.appInstance = appInstance;
        this.buildApp = new BuildAppAction();
        this.docker = new DockerService();
        this.ports = new PortsService();
        this.compiler = new CompileAppAction(appInstance);
    }
    deploy(_env) {
        this.getDomainSchema().then((actualPath)=>this.importDomainMetadata(actualPath));
    }

    getDomainSchema() {
        return new Promise((resolve,reject)=>{
            var actualPath = shell.pwd();
            var path = os.homedir()+"/installed_plataforma/domain_schema";
            if (fs.existsSync(path)){
                shell.cd(path);
                shell.exec("git pull");
            }else{
                shell.rm("-rf",path);
                shell.mkdir(path);
                shell.cd(path);
                shell.cd(" ..");
                shell.exec("git clone https://github.com/onsplatform/domain_schema.git");
            }
            resolve(actualPath);
        })
    }

    importDomainMetadata(actualPath) {
        return new Promise((resolve,reject)=>{
            var yamlPath = actualPath+"/Dominio";
            var path = os.homedir()+"/installed_plataforma/domain_schema";
            shell.cd(path);
            shell.exec("pip install pipenv");
            shell.exec("pipenv install");
            shell.exec("set POSTGRES_HOST=localhost");
            shell.exec("echo POSTGRES_HOST=localhost >.env");
            shell.exec("pipenv run python manage.py import_data "+yamlPath+ " sager");
        })
    }


};
