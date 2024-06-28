
import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import authRouter from './routes/authRoutes.js';
import jobRouter from './routes/jobRoutes.js';
import profileRouter from './routes/profileRoutes.js';
import cors from 'cors';


const PORT = process.env.PORT || 8000;
const connString = `${process.env.MONGO_URL}`;
const app = express();

// Connect to the database
mongoose.connect(connString).then(() => {
    console.log('Connected to the database');
}).catch((err) => console.log(err));


// Middleware
import cookieParser from 'cookie-parser';


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const corsOptions = {
    origin: process.env.VITE_NODE_ENV == "development" ? "http://localhost:5173" : process.env.VITE_CLIENT_BASE_URL
    ,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};
console.log("corsOptions are: ", corsOptions);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use('/', authRouter);
app.use('/', jobRouter);
app.use('/', profileRouter);

app.get('/hello', (req, res) => {
    res.send('Hello World');
})

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);


});
