const shell = require("shelljs");
const os = require("os");
const AppInstance = require("../app_instance");
const uuidv4 = require('uuid/v4');
const inquirer = require('inquirer');
const fs = require("fs");
module.exports = class InstallPlatformAction{

    exec(){

        inquirer.prompt(this.getQuestions()).then(answers => {
            var environment = answers["environment"];
            console.log(os.tmpdir());
            var path = os.tmpdir()+"/installed_plataforma";
            shell.rm("-rf",path);
            shell.mkdir('-p', path);
            shell.cd(path);
            shell.exec("git clone https://github.com/ONSBR/Plataforma-Installer.git");
            shell.cd("Plataforma-Installer");
            shell.exec("docker-compose build --no-cache");
            shell.exec("docker-compose up -d");
        });
    }

    getQuestions(){
        var questions = [];

        var q0 = {
            type: "input",
            default: "local",
            name: "environment",
            message: "Ambiente"
       };         
       questions.push(q0);
       return questions;
     }
}