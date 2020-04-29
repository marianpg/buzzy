'use strict'

const BuzzyServer = require('buzzy').server

const config = {
    routing: {
        magic: true
    },
    templating: {
        validation: true
    }
}

const server = new BuzzyServer(config)

server.start()