'use strict'

import { DatabaseConfig } from '../../public/config'
import { Database as IDatabase } from '../../public/database'



import { LoggingService } from '../logging'
import { FileUtils } from '../filesystem-utils'
import { GlobalData } from '../../public/global'
import { GlobalDataService } from './global-data-service'
import { FileDataService } from './file-data-service'
import { SqlDataService } from './sql-data-service'



// import sequelize

// TODO: yaml global.yaml should be possible

// TODO: json and sqlite databases are possible
// read from config which to choose and to deliver
// ==> need for generic functions to open/save json and to run sql statements

export class DatabaseService {
    
    private globalDataService: GlobalDataService
    private fileDataService: FileDataService
    private sqlDataService: SqlDataService

    constructor(
        private config: DatabaseConfig,
        private logService: LoggingService,
        private fileUtils: FileUtils
    ) {
        this.sqlDataService = new SqlDataService(
            this.config.sqliteData,
            this.logService.create('sql-data', this.config.sqliteData.logging),
            this.fileUtils
        )
        this.globalDataService = new GlobalDataService(
            this.config.globalData,
            this.logService.create('global-data', this.config.globalData.logging),
            this.fileUtils,
            this.sqlDataService
        )
        this.fileDataService = new FileDataService(
            this.config.fileData,
            this.logService.create('file-data', this.config.fileData.logging),
            this.fileUtils,
            this.sqlDataService
        )
    }

    async build(): Promise<DatabaseService> {
        await this.globalDataService.build()
        await this.fileDataService.build()
        await this.sqlDataService.build()

        return this
    }

    async reload(): Promise<void> {
        await this.globalDataService.reload()
        await this.fileDataService.reload()
        await this.sqlDataService.reload()
    }

    async getGlobalData(): Promise<GlobalData> {
        return this.globalDataService.getData()
    }

    async getDatabase(): Promise<IDatabase> {
        return this.fileDataService.getDatabase()
    }
    
    async parseAndExecuteSql(obj: Record<string, any>, params: Record<string, any>): Promise<Record<string, any>> {
        return this.sqlDataService.parseAndExecuteSql(obj, params)
    }

    async save(): Promise<void> {
        await this.fileDataService.save()
    }
}