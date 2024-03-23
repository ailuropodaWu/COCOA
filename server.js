const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Parse JSON bodies
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(bodyParser.json());

app.get('/prompt', (req, res) => {
    // Send a response back to the client
    res.send('Data received successfully!');
  });

// POST route to handle incoming data
app.post('/prompt', (req, res) => {
    var globalVariables = {
        postData: req.body
    } // This will contain the posted data from Angular
    res.send(req.body)
});

// Start the server
const PORT = 4204; // You can change the port number if needed
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);    
});

