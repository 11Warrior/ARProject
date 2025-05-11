const path = require('path');
const express = require('express')
const fs = require('fs');
const dotenv = require('dotenv');

/**
 * Configure env variables
 */
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express()
const http = require('http')
const bodyParser = require('body-parser');
const cors = require('cors');

const homeRouter = require('./routes/home.routes');
const exerciseRouter = require('./routes/exercise.routes');

/**
 * Create Express server 
 * @type {Server}
 */
const server = http.createServer(app);

const mongoSanitize = require('express-mongo-sanitize');

app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.static('public'))
app.use(
    mongoSanitize({
        onSanitize: ({ req, key }) => {
            console.warn(`This request[${key}] is sanitized`, req);
        },
    }),
);

app.use(bodyParser.json({ limit: '50mb' }));
app.set('view engine', 'ejs')

app.use('/', homeRouter);
app.use('/exercise', exerciseRouter);

//start server
const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))