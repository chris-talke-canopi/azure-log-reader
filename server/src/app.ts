import express, { Express } from 'express'
import path from 'path'
import cors from 'cors'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import _ from 'lodash'

import config from './config.json'
import router from './routes'
import { Drizzle } from './database/database'

const app: Express = express()
const port = config.port || 7829

export const drizzle = new Drizzle();
export const database = drizzle.db();

function StartWebServer() {

    app.use(cors())
    app.use(express.json())
    app.use(cookieParser())
    app.use(compression())

    const publicFolder = path.join(__dirname, '/public/')
    app.use(express.static(publicFolder))

    app.use('/', router)

    app.listen(port, () => {
        console.log(` _____________________________________________________`)
        console.log(`|                                                     |`)
        console.log(`|   Web Server is running at: http://localhost:${port}   |`)
        console.log(`|_____________________________________________________|`)
    })
}

StartWebServer();

export { passport };