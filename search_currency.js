import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';

const app = express();
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'wyt!!010611ABC',
    database: 'exchange'
}); 

app.get('/currency/:id', (req, res) => {
    connection.query(`SELECT * FROM currency WHERE currency_id = ${req.params.id}`, 
    (error, 
    results,
    fields) => {
        res.json(results);
    });
});


app.listen(8081, () => {
    console.log('Server is running on port 8081');
});