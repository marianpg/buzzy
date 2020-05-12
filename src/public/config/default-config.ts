'use strict'

import { Config } from '.'


export const DefaultConfig: Config = {
    rootPath: process.cwd(),
    language: 'de',
    loggingActive: ['info', 'data', 'warn', 'error', 'debug'],
    server: {
        host: 'localhost',
        port: 8080,
        logging: true
    },
    routing: {
        magic: false,
        fileName: 'routes',
        fileExtension: 'json',
        reloadOnEveryRequest: true,
        logging: true
    },
    templating: {
        validation: true,
        paths: {
            pages: 'pages',
            templates: 'templates',
            helpers: 'helpers',
            controller: 'controller'
        },
        allowedExtensions: ['html', 'hbs'],
        frontmatterFormat: 'json',
        helpers: {
            reloadOnEveryRequest: true,
        },
        logging: true
    },
    sessions: {
        active: false,
        path: 'sessions',
        logging: true
    },
    database: {
        globalData: {
            active: true,
            reloadOnEveryRequest: true,
            pathToFile: './global.json',
            format: 'json',
            logging: true
        },
        fileData: {
            active: false,
            reloadOnEveryRequest: true,
            path: './data',
            format: 'json',
            logging: true
        },
        sqliteData: {
            active: false,
            reloadOnEveryRequest: true,
            pathToFile: './data/sqlite.db',
            logging: true
        }
    }
}