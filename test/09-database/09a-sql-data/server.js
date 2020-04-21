'use strict'

const BuzzyServer = require('buzzy').server

const config = {
    routing: {
        magic: false
    },
    templating: {
        validation: false
    },
    database: {
        sqliteData: {
            active: true
        }
    }
}

const server = new BuzzyServer(config)

server.start()