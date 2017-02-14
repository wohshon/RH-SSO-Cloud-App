var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require('fh-mbaas-api');



function productRoute() {
  var product = new express.Router();
  product.use(cors());
  product.use(bodyParser());
    var token='';


  // GET REST endpoint - query params may or may not be populated
  product.get('/', function(req, res) {
    console.log(new Date(), 'In product  route GET / req.query=', req.query);
    var world = req.query && req.query.hello ? req.query.product : 'World';

    // see http://expressjs.com/4x/api.html#res.json
    res.json({msg: 'Hello GET Product  ' + world});
  });

  // POST REST endpoint - note we use 'body-parser' middleware above to parse the request body in this route.
  // This can also be added in application.js
  // See: https://github.com/senchalabs/connect#middleware for a list of Express 4 middleware
  product.post('/', function(req, res) {
    console.log(new Date(), 'In product route POST / req.body=', req.body);
    console.log(req.body.uname);
    $fh.service({
      "guid" : "yi7sit6isgpo4ezdohun5whr",
      "path": "/hello", //the path part of the url excluding the hostname - this will be added automatically
      "method": "POST",   //all other HTTP methods are supported as well. e.g. HEAD, DELETE, OPTIONS
      "params": {
         //"grant_type" : "client_credentials",
         //"client_secret":"58b4d99f-a5d7-471c-b500-9fb91d73b6da",
         //"client_id" : "demo-rest",
         "uname":req.body.uname,
         "upassword": req.body.upassword
      }, //data to send to the server - same format for GET or POST
      "timeout": 25000, // timeout value specified in milliseconds. Default: 60000 (60s)
      "headers" : {
        // Custom headers to add to the request. These will be appended to the default headers.
      }      
    }, function(err, body, response) {
      if (err || !body) {
              console.log('got ======= ERROR');
      }
        console.log('got ======='+body)
        if ( !body.access_token.error ) {
          token=body.access_token;
          callProduct(token,res,req);
        }  else {
          res.json({msg: body.access_token.error_description });  
        }
       
    });
  });
  return product;
}

function callProduct(token,res,req) {
  console.log('got access token: '+token);
  if (!token.error) {
    //===================================
        $fh.service({
          "guid" : "23a7isqqghlhugweil244fyq",
          "path": "/product", //the path part of the url excluding the hostname - this will be added automatically
          "method": "POST",   //all other HTTP methods are supported as well. e.g. HEAD, DELETE, OPTIONS
          "params": {
            "access_token": token,
            "test": "test1234"
          }, //data to send to the server - same format for GET or POST
          "timeout": 25000, // timeout value specified in milliseconds. Default: 60000 (60s)
          "headers" : {
            // Custom headers to add to the request. These will be appended to the default headers.
            //'Authorization' : 'bearer '+token
          }      
        }, function(err, body, response) {
          if (err || !body) {
                  res.json({msg: 'Error retrieving product information' + err});
          }

          if (body!='Access denied') {
              var products=body.products;
              var results="<div>Products:</div><div></div>";
              for (var i=0;i<products.length;i++) {
                results+="<div>"+products[i].name+ " $"+products[i].price+"</div>";
              }
              res.json({msg: results });  
            }
         else {
          res.json({msg: 'Access denied' });  
         } 
        });    
    //===================================
   } // have token
   else {
    res.json({msg: token.error_description });  
   }
}

module.exports = productRoute;
