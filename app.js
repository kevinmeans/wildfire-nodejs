const express = require("express");
const mysql = require('mysql');
const app = express(),
    bodyParser = require("body-parser"),
    port = 3080;


app.use(bodyParser.json());

let ret;
let geojson_template;
const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'user',
  password : 'password',
  database : 'database'
});

app.get('/api/smoke/geojson', (req, res) => {
  pool.getConnection((err, connection) => {
      if(err) throw err;
      console.log('connected as id ' + connection.threadId);
      // Get all offenders in the last week
      connection.query('SELECT offend_time,latitude,longitude from smoke_radius where offend_time>UNIX_TIMESTAMP(NOW())-604800', (err, rows) => {
          connection.release(); // return the connection to pool
          if(err) throw err;
          geojson_template = {
            "name":"PurpleAirDataPoint",
            "type":"FeatureCollection",
            "features":[]
          };
          ret=rows;
          results = rows.map(v => Object.assign({}, v));
          results.forEach((row) => {
              geojson_template.features.push({ "type": "Feature","geometry": {"type": "Point","coordinates": [row.longitude,row.latitude]},"properties": {"id":(Math.random() + 1).toString(36).substring(7),"mag":1,"offend_time":row.offend_time} });
          });
      });
  });
  res.send(geojson_template);
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});