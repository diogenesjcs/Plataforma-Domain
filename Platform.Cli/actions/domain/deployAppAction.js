const fs = require("fs");
const BuildAppAction = require("./buildAppAction");
const CompileAppAction = require("./compileAppAction");
const DockerService = require("../../services/docker");
const PortsService = require("../../services/ports");
const shell = require("shelljs");
const os = require("os");
const System = require("plataforma-sdk/services/api-core/system");
const BaseDeployAction = require("../baseDeployAction");

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
        this.saveSystem(_env).then(this.getDomainSchema().then((actualPath)=>this.importDomainMetadata(actualPath)));
    }

    saveSystem(env) {
        return new Promise((resolve,reject)=>{
        var systemCore  = new System(env.apiCore)
            systemCore.findById(env.conf.solution.id).then(found =>{
                if (found.length === 0) {
                    systemCore.create(env.conf.solution).then(()=>{
                        resolve(env)
                    }).catch(reject)
                }else{
                    resolve(env)
                }
            }).catch(reject)
        });
    }

    importDomainMetadata(actualPath) {
        return new Promise((resolve,reject)=>{
            var yamlPath = actualPath+"/Dominio";
            var path = os.homedir()+"/installed_plataforma/domain_schema";
            shell.cd(path);
            shell.exec("pip install pipenv");
            shell.exec("pipenv install");
            shell.exec("pipenv install pyyaml");
            shell.exec("echo POSTGRES_HOST=localhost >.env");
            shell.exec("pipenv run python manage.py import_data "+yamlPath+ " sager --clear_before_import");
            resolve();
        })
    }


};
