import express from 'express'
import "dotenv/config"
const app = express()
import fileUpload from 'express-fileupload'
import path from 'path';
import helmet from 'helmet';
import cors from 'cors'
import { limiter } from './config/rateLimiter.js';
import { fileURLToPath } from 'url';
import ApiRoutes from './routes/api.js'

const PORT = process.env.PORT || 8000
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors({
  origin: '*'
}))

app.use(limiter)
app.use(express.static(path.join(__dirname, 'public')));// serving static files from public folder)
app.use(fileUpload())

// importing routes from routes folder and using it as middleware
app.use('/api', ApiRoutes)


app.get('/', (req, res) => {
  res.send('Hello, World!')
})




app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);

})


