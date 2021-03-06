const keys = require('./keys');

// Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Get request from one domain and send to another
app.use(cors());
// Convert body of request to json
app.use(bodyParser.json());

// Create and connect to Postgres
const { Pool } = require('pg');
const pgClient = new Pool( {
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG connection'));

// Create the table if it does not exist
// This does not work for some reason when the pg version in the
// package.json is set to ^8.0.3. Oddly enough, it does work when
// the version is set to just 8.0.3
//pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
//    .catch((err) => console.log(err));
    
// This works when the pg version in the package.json is set to ^8.0.3
// Is most likely because of a race condition where the postgres pod
// is not running so the connection doesn't happen
// The on connect will make it wait to connect then run the command
pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err));
});

// Redis (cache) client set up
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// This is required per Redis docs in order to use a listener
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    // Get the values from postgres and return them
    const values = await pgClient.query('SELECT * from values');
    // Print what was returned to the CLI console, NOT the browser console!
    //console.log("", values.rows);
    // Return hard code just for testing
    //res.send([{ number: 1 }, { number: 2 }, { number: 3 }]);
    // This is the real code
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    // Get the values from redis and return them
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    // Get the values from the form
    const index = req.body.index;

    // Do not process indexes higher than 40 as it could take forever
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }
    
    // This is the value for the index, set to Nothing yet by default
    // It will get replaced after it is calculated
    redisClient.hset('values', index, 'Nothing yet!');

    // Insert the value into the Redis DB
    redisPublisher.publish('insert', index);

    // Insert the value into the Postgres DB
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    // Send a response
    res.send({ working: true });
});

// Listen on port 5000
app.listen(5000, err => {
    console.log('Listening');
});

