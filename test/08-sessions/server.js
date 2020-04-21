'use strict'

const BuzzyServer = require('buzzy').server

const config = {
    routing: {
        magic: false
    },
    sessions: {
        active: true
    }
}

const server = new BuzzyServer(config)

server.start()