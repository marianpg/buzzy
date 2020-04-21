'use strict'

const BuzzyServer = require('buzzy').server

const config = {
    routing: {
        magic: false
    },
    sessions: {
        active: true
    },
    templating: {
        validation: false
    }
}

const server = new BuzzyServer(config)

server.start()