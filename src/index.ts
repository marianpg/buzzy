'use strict'

import { Config } from './public/config'

import { parseConfig } from './application/config'
import { LoggingService, Logging } from './application/logging'
import { Application } from './application'
import { FileUtils } from './application/filesystem-utils'

export interface FHWedelWebInterface {
    start(): Promise<void>
    stop(): Promise<void>
}

// TODO express.Router({ caseSensitive: true })
// TODO CodeStyle (Spaces instead of Tabs)
export class FHWedelWeb implements FHWedelWebInterface {

    private logging: Logging
    private config: Config
    private app: Application

    constructor(
        config?: RecursivePartial<Config>
    ) {
        this.config = parseConfig(config)
        const shouldLog = this.config.server.logging

        const logService = new LoggingService(this.config.loggingActive)
        this.logging = logService.create('server', shouldLog)

        const fileUtils = new FileUtils(
            logService.create('filesystem', shouldLog),
            this.config.rootPath
        )
        this.app = new Application(this.config, logService, fileUtils)
    }

    async start(): Promise<void> {
        try {
            await this.app.start()
            this.logging.info('Application started successfully')
        } catch (err) {
            this.logging.error('Application start failed')
        }
    }

    async stop(): Promise<void> {
        try {
            await this.app.stop()
            this.logging.info('Application stopped successfully')
        } catch (err) {
            this.logging.error('Application stop failed')
        }
    }
}