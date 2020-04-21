'use strict'

import { Config } from '.'
import { Languages } from './languages'
import { FrontmatterType } from '../frontmatter'
import { LoggingTypes } from './logging-types'
import { RoutingFileExtensions } from './routing-config'


export const DefaultConfig: Config = {
    rootPath: process.cwd(),
    language: Languages.DE,
    loggingActive: [LoggingTypes.INFO, LoggingTypes.WARN, LoggingTypes.ERROR],
    server: {
        host: 'localhost',
        port: 8080,
        logging: true
    },
    routing: {
        magic: false,
        fileName: 'routes',
        fileExtension: RoutingFileExtensions.JSON,
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
        frontmatterFormat: FrontmatterType.JSON,
        logging: true
    },
    sessions: {
        active: false,
        path: 'sessions',
        logging: true
    },
    database: {
        reloadOnEveryRequest: true,
        globalFile: 'global.json',
        path: 'data',
        sqlite: false,
        sqliteFilename: 'database.sqlite',
        logging: true
    }
}