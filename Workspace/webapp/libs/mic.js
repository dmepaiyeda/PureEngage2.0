module.exports = function (app, io, workspaceApi, storage, request, statisticsApi, provisioningApi) {
    var record = require('node-record-lpcm16')
    var fs = require('fs')
    
    var file = fs.createWriteStream('test.wav', { encoding: 'binary' })
    function startRecord(){
    record.start().pipe(file)
    console.log("Recording");
    
    // Stop recording after three seconds
    setTimeout(function () {
    record.stop()
    }, 3000)
    }
}