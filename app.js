const express = require('express');
const xss = require('xss-clean');
const rateLimiting = require('express-rate-limit');
const cors = require("cors");
const hpp = require("hpp");
const helmet = require("helmet");
const connectToDb = require('./config/connectToDb.js');
const { verifyToken } = require('./middlewares/verifyToken.js');
const { errorhandler, notFound } = require('./middlewares/error.js');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(express.json());

//connection To DB
connectToDb();

//prevent xss (cross site scripting) attacks
app.use(xss());

//security headers(helmet)
app.use(helmet());

//prevent http param pollution
app.use(hpp());

//Rate Limiting
app.use(rateLimiting({
  windowMs: 10 * 60 * 1000, // 10 دقايق
  max: 20, // مسموح فقط بـ 3 محاولات تسجيل دخول خلال 10 دقايق
  message: "Too many login attempts, please try again after 10 minutes.",
}))

//cors policy
app.use(cors({
  origin: process.env.CLIENT_DOMAIN,
}));

//routes
app.use("/api/auth" , require("./routes/authRoute.js"));
app.use("/api/users" , verifyToken , require("./routes/usersRoute.js"));
app.use("/api/posts" , verifyToken , require("./routes/postRoute.js"));
app.use("/api/comments" , verifyToken , require("./routes/commentRoute.js"));
app.use("/api/categories" , verifyToken , require("./routes/categoriesRoute.js"));
app.use("/api/password" , require("./routes/passwordRoute"));

//errorHandler middleware
//لازم تبقي بعد كل الراوت
app.use(notFound);
app.use(errorhandler);

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(PORT, () => console.log(`Example app listening on port: ${PORT}!`));