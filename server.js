import { server } from '@hapi/hapi'
import inert from '@hapi/inert' // serving statics files
import vision from '@hapi/vision' // templating
import hbs from 'handlebars'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { showAthletes, getAuth, userInfo } from './routes/index-router.js'

const DIR = dirname(fileURLToPath(import.meta.url))

async function init() {
    const s = server({
        port: process.env.PORT || 8080,
        routes: {
            files: {
                relativeTo: DIR,
            }
        }
    })
    await s.register(inert)//register for statics files
    await s.register(vision)//register for template engine
  
    s.views({
        relativeTo: DIR,
        path: './templates',
        layout: true,
        layoutPath: './templates/layout',
        engines: {
            html: hbs
        },
        compileMode: 'sync',
        isCached: true
    })

    s.route({
        method: 'GET',
        path: '/public/{param*}',
        handler: {
            directory: {
                path: './public',
            }
        }
    })
    s.route({
        method: 'GET',
        path: '/confirm',
        handler: getAuth
    })
    s.route({
        method: 'GET',
        path: '/',
        handler: showAthletes
    })
    s.route({
        method: 'GET',
        path: '/athlete',
        handler: userInfo
    })
    await s.start()
    console.log('server started: ', s.info.uri, ' started at: ', new Date(s.info.started))
}

process.on('unhandledRejection', err => {
    console.error(err)
    process.exit(1)
})

init()