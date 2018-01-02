const Sequelize = require('sequelize');
var Handlebars = require('handlebars');
var root = "../Platform.App/";
Handlebars.registerHelper( "join", function( obj, sep, options ) {    
    return Object.keys(obj).map(function( item ) {        
        return options.fn( obj[item] );
    }).join( sep );
});

Handlebars.registerHelper( "eq", function( lvalue, rvalue, options ) {           
    if (lvalue != rvalue) {
        return options.inverse(this)
    } else {
        return options.fn(this)
    }
});

var fs = require("fs");

module.exports = (function(){
    var self = {};
    self.model = {};
    self.model.tables = {};
    self.model.relationships = [];
    self.model.seeds = {};

    var keys = (model) => Object.keys(model)    
    var hasValue = (array,value) => array.filter(v => v === value).length > 0;

    var isRelationship = (value) => ["hasMany","belongsTo","hasAndBelongsTo"].filter(v => v === value).length > 0;
    /**
     * 
     * @param {JSON} model é o modelo definido no YAML no formato JSON
     * @description Este método carrega o modelo do YAML e verifica se ele já foi previamente
     * carregado e adiciona na estrutra de dados de modelos que serão compilados na aplicação de 
     * dominio da plataforma
     */
    self.loadModel = function(model){
        var name = keys(model)[0];
        if (self.model.tables[name]){
            throw "model " + name + " already defined";
        }
        self.model.tables[name] = {};
        self.model.tables[name].columns = [];
        
        var _model = self.model.tables[name];
        _model.tableName = name; //by default
        _model.columns = [];
        var columns = keys(model[name]);
        columns.forEach(column => {
            if (isRelationship(column)){
                self.model.relationships.push([name,column,model[name][column][0]]);
                return;
            }            
            var modelColumn = {};
            modelColumn.name = column;
            var attrs = model[name][column];
            modelColumn.attributes = attrs;
            self.model.tables[name].columns.push(modelColumn);            
        });        
    };

    /**
     * @description Compila o modelo de dados declarados no YAML
     * para JavaScript/Sequelize através de um template definido 
     * dentro da pasta Platform.App/node_template/model/domain.tmpl
     */
    self.compile = ()=>{
        var tables = keys(self.model.tables);
        tables.forEach(t => {
            self.compileTable(self.model.tables[t]);
        });

        var source = fs.readFileSync(root+"node_template/model/domain.tmpl").toString();
        var template = Handlebars.compile(source);
        var obj = { "model":self.sequelizeModel, "relations":self.model.relationships};        
        var compiled = template(obj);
        return compiled;
    };

    /**
     * 
     * @param {JSON} obj modelo de dominio na estrutura de dados pre compilacao
     * @param {Array<String>} array lista de atributos do dominio
     * @description Define o tipo da coluna já no formato do Sequelize
     */
    var defineType = (obj,array) => array.forEach(v => {
        if (self.seqTypeMap[v]){
            obj.type = self.seqTypeMap[v];
            return false;
        }
    });

    self.seqTypeMap = {
        "string":"Sequelize.STRING",
        "integer":"Sequelize.INTEGER",
        "char":"Sequelize.CHAR",
        "text":"Sequelize.TEXT",
        "bigint":"Sequelize.BIGINT",
        "float":"Sequelize.FLOAT",
        "real":"Sequelize.REAL",
        "double":"Sequelize.DOUBLE",
        "decimal":"Sequelize.DECIMAL",
        "boolean":"Sequelize.BOOLEAN",
        "time":"Sequelize.TIME",
        "date":"Sequelize.DATE",
        "hstore":"Sequelize.HSTORE",
        "json":"Sequelize.JSON",
        "jsonb":"Sequelize.JSONB",
        "blob":"Sequelize.BLOB",
        "uuid":"Sequelize.UUID",
        "uuidV1":"Sequelize.UUIDV1",
        "uuidV4":"Sequelize.UUIDV4"
    };
    
    self.sequelizeModel = {};
    
    /**
     * 
     * @param {JSON} table estrutura pre compilacao
     * @description compila um objeto de dominio para ja considerando 
     * detalhes de chave ou atributos
     */
    self.compileTable = (table)=>{        
        var tableDefinition = {};              
        table.columns.forEach(c => {
            tableDefinition[c.name] = {};
            tableDefinition[c.name].name = c.name;
            defineType(tableDefinition[c.name],c.attributes);
            if (hasValue(c.attributes,"primary key")){
                tableDefinition[c.name].primaryKey = true;
            }
            if (hasValue(c.attributes,"auto increment")){
                tableDefinition[c.name].autoIncrement = true;
            }            
        });  
        self.sequelizeModel[table.tableName] = tableDefinition;      
    };
    return self;
})();