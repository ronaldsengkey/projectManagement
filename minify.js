const path = require('path');
const fs = require('fs-extra');
const compressor = require('node-minify');
const backupDir = 'backups';

exports.getFileList = async function getFileList(params) {
    let result = await getSubDir(params);
    return result;
}

function getSubDir(dir){
    let directoryPath = path.join(__dirname, dir);
    return new Promise(async function(resolve, reject){
        fs.readdir(directoryPath, async function (err, files) {
            let result = [];
            if (err) {
                console.log('Unable to scan directory: ' + err);
                resolve(result)
            } 
            for (let file of files) {
                if (file.split('.').length < 2) {
                    if (file != backupDir) {
                        let subs = await getSubDir(dir + '/' + file);
                        for(let sub of subs){
                            result.push(file + '/' + sub);
                        }    
                    }
                }
                else {
                    result.push(file);
                }
            }
            resolve(result);
        });
    })
}

exports.startMinify = async function startMinify(dir) {
    let paths = await this.getFileList(dir);
    let backupPaths = await this.getFileList(dir + "/" + backupDir);
    for(let path of paths){
        if (backupPaths.includes(path)) {
            setMinify(dir + "/" + backupDir + "/" + path, dir + '/' + path)
        }
        else {
            if(backupFile(dir + '/', path)){
                setMinify(dir + '/' + path, dir + '/' + path);
            }
        }
    }
    return true;
}

function setMinify(from, to){
    var promise = compressor.minify({
        compressor: 'gcc',
        input: from,
        output: to
    });
    promise.then(function(min) {
        console.log("setMinify: success");
    });
}

function backupFile(dir, file) {
    try {
        fs.copySync(path.resolve(__dirname, dir + file), dir + backupDir + '/' + file);
        console.log("success backup: " + file);
        return true;
    } catch(err) {
        console.log("error: ", err);
        return false;
    }
}