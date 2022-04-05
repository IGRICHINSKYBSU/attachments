const fs = require('fs');
const http = require('http');
const path = require('path');
const PORT = 8080;

http.createServer(function(req, res) {

    var aPath = req.url.substring(1).split("/");
    var sFileName = aPath[aPath.length - 1];
    console.log(aPath)
    aPath.splice(aPath.length - 1, 1);
    var sFullPath = path.resolve(__dirname, aPath.join("/"));

    switch (req.method) { 
        case "GET":
            fs.readFile(path.resolve(sFullPath, sFileName), function(err, data) {
                if (err) {
                    res.writeHead(404, {"content-type":"application/json"});
                    res.end(JSON.stringify({"Message": "File not found."})); 
                } else {
                    res.writeHead(200);
                    res.write(data);
                    res.end();
                }
            });
            break;
        case "POST":
            if (!fs.existsSync(sFullPath)) {
                fs.mkdirSync(sFullPath, {
                    recursive: true
                });
            }
        
            // console.log(path.resolve(sFullPath, sFileName))
            var writeStream = fs.createWriteStream(path.resolve(sFullPath, sFileName));
          
            // This pipes the POST data to the file
            req.pipe(writeStream);
          
            // After all the data is saved, respond with a simple html form so they can post more data
            req.on('end', function () { 
              res.writeHead(200, {"content-type":"application/json"});
              res.end(JSON.stringify({"Message": "Successfully uploaded."}));
            });  
          
            // This is here incase any errors occur
            writeStream.on('error', function (err) {
                res.writeHead(500, {"content-type":"application/json"})
                res.end(JSON.stringify({Error: err})); 
            });
            break;
        default:
            res.writeHead(404, {"content-type":"application/json"})
            res.end(JSON.stringify({"Message": `Bad request method ${req.method}. Only GET, PUT supported.`})); 
            break;
    }
  }).listen(PORT);