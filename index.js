const fs = require('fs');
const command = "createStoredProcedureCommands";

async function run() {
    await fs.readFile('./StoredProcedure/Parameters.txt', 'utf8', function(err, lines) {
        const lineArray = lines.split('\n');
        if (command === "createStoredProcedureCommands") {
            createStoredProcedureCommands(lineArray);
        } else if (command === "createModel") {
            createModel(lineArray);
        }   
    });
}

function getDataTypeModel(type) {
    switch(true) {
        case /NVARCHAR2/.test(type):
            return "string";
        case /NUMBER/.test(type):
            return "int";
        case /DATE/.test(type) || /TIMESTAMP/.test(type):
            return "DateTime";
        case /CHAR/.test(type):
            return "bool";
        default:
            return "";    
    }
}

function getDataTypeCommand(type) {
    switch (true) {
        case /NVARCHAR2/.test(type):
            return "NVarchar2";
        case /NUMBER/.test(type):
            return "Decimal";
        case /CHAR/.test(type):
            return "Char";
        case /TIMESTAMP/.test(type):
            return "TimeStamp";
        case /DATE/.test(type):
            return "Date";
        default:
            return ""; 
    }
}

function getNullable(array, type) {
    if (type === "string" || type === "DateTime") {
        return false;
    } else if (type === "int" || type === "bool") {
        if (array.length > 3 && new RegExp("null").test(array[array.length-1])) {
            return true;
        } else {
            return false;
        }
    }
}

function createModel(lineArray) {
    let line, arr, datatype;
    for (let i = 0; i < lineArray.length; i++) {
        line = lineArray[i];
        //Remove first two characters
        line = line.substring(4, line.length);
        //Create array
        arr = line.split(" ");
        arr = arr.filter(x => x !== "");
        //Add public
        arr.unshift("public");
        //Get datatype
        datatype = getDataTypeModel(arr[3]);
        //Finish the line 
        line = arr[0] + " " + datatype + (getNullable(arr, datatype) ? "?" : "") + " " + arr[1] + " { get; set; }"; 
        console.log(line);
    }
}

function createStoredProcedureCommands(lineArray) {
    let line, arr, datatype;
    for (let i = 0; i < lineArray.length; i++) {
        line = lineArray[i];
        //Remove first two characters
        line = line.substring(2, line.length);
        //Create array
        arr = line.split(" ");
        arr = arr.filter(x => x !== "");
        //Add command parameter
        arr.unshift("command.Parameters.Add(\"");
        //Get datatype
        datatype = getDataTypeCommand(arr[3]);
        //Finish the line
        line = arr[0] + arr[1] + "\", OracleDbType." + datatype + ", ParameterDirection.Input).Value = model." + arr[1].substring(2, arr[1].length) + ";";
        console.log(line);
    }
}

run();