'use strict'

const BuzzyServer = require('buzzy').server

const config = {
    routing: {
        magic: false
    }
}

const server = new BuzzyServer(config)

server.start()