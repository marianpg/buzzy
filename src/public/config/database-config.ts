'use strict'


export interface DatabaseConfig {
    reloadOnEveryRequest: boolean
    globalFile: string
    path: string
    sqlite: boolean
    sqliteFilename: string
    logging: boolean
}