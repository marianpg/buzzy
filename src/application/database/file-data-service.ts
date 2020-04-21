'use strict'

import { FileDataConfig } from "../../public/config/database-config"
import { Database as IDatabase, JsonData } from '../../public/database'

import { Logging } from "../logging"
import { FileUtils } from "../filesystem-utils"
import { LoadJsonFunction, SavejsonFunction, ExecuteSqlFunction, JsonDataFiles } from "./types"
import { SqlDataService } from "./sql-data-service"
import { isDefined } from "../helper"


class Database implements IDatabase {
    constructor(
        public loadJson: LoadJsonFunction,
        public saveJson: SavejsonFunction,
        public executeSql: ExecuteSqlFunction
    ) { }
}

export class FileDataService {
    private database: IDatabase
    private data: JsonDataFiles

    constructor(
        private config: FileDataConfig,
        private logging: Logging,
        private fileUtils: FileUtils,
        private sqlDataService: SqlDataService,
    ) { }

    private loadJson(filename: string): JsonData | null {
        return isDefined(this.data[filename])
            ? JSON.parse(JSON.stringify(this.data[filename]))
            : null
    }

    private saveJson(filename: string, data: JsonData): void {
        this.data[filename] = data
    }

    // TODO: Unhandled Promise Rejection
    private async _build(): Promise<void> {
        const result: JsonDataFiles = {}

        const files = await this.fileUtils.listFiles({
            directory: this.config.path, recursively: true
        })

        await Promise.all(
            files.map(async (filename) => {
                if (filename.endsWith(`.${this.config.format}`)) {
                    result[filename] = await this.fileUtils.readJson(filename)
                }
            })
        )

        this.data = result
        this.database = new Database(this.loadJson, this.saveJson, this.sqlDataService.query)
    }

    async build(): Promise<FileDataService> {
        if (this.config.active) {
            await this._build()
        }
        return this
    }

    async reload(): Promise<void> {
        if (this.config.reloadOnEveryRequest) {
            await this.build()
        }
    }

    async getDatabase(): Promise<IDatabase> {
        await this.reload()
        return this.database
    }

    async save(): Promise<void> {
        await Promise.all(
            Object.keys(this.data).map(async (filename) => {
                await this.fileUtils.writeJson(this.data[filename], filename, this.config.path)
            })
        )
    }
}