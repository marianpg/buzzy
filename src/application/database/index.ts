'use strict'

import { DatabaseConfig } from '../../public/config'
import { Database as IDatabase, SqlStatementResult, JsonData, ResultType, AllResultTypes } from '../../public/database'

const SqliteDatabase = require('better-sqlite3')

import { isDefined, hasKeys } from '../helper'

import { Logging } from '../logging'
import { FileUtils } from '../filesystem-utils'
import { GlobalData } from '../../public/global'



// import sequelize

// TODO: json and sqlite databases are possible
// read from config which to choose and to deliver
// ==> need for generic functions to open/save json and to run sql statements

type Filename = string
type Json = Record<string, any>
type JsonDataFiles = Record<Filename, Json>

type LoadJsonFunction = (filename: string) => JsonData
type SavejsonFunction = (filename: string, data: JsonData) => void
type ExecuteSqlFunction = (sql: string, params: Record<string, any>) => Promise<Record<string, any>[]>//Promise<SqlStatementResult>

class Database implements IDatabase {
    constructor(
        public loadJson: LoadJsonFunction,
        public saveJson: SavejsonFunction,
        public executeSql: ExecuteSqlFunction
    ) { }
}


export class DatabaseService {
    private database: IDatabase
    private jsonDataFiles: JsonDataFiles
    private globalData: GlobalData
    private sqliteDatabase: any

    constructor(
        private config: DatabaseConfig,
        private logging: Logging,
        private fileUtils: FileUtils
    ) { }

    async build(): Promise<DatabaseService> {
        this.load()

        return this
    }

    loadJson(filename: string): JsonData | null {
        return isDefined(this.jsonDataFiles[filename])
            ? JSON.parse(JSON.stringify(this.jsonDataFiles[filename]))
            : null
    }

    async saveJson(filename: string, data: JsonData): Promise<void> {
        this.jsonDataFiles[filename] = data
    }

    // TODO: Unhandled Promise Rejection
    private async loadJsonData(): Promise<void> {
        const result: JsonDataFiles = {}

        const files = await this.fileUtils.listFiles({
            directory: 'data', recursively: true
        })

        await Promise.all(
            files.map(async (filename) => {
                if (filename.endsWith('.json')) {
                    result[filename] = await this.fileUtils.readJson(filename)
                }
            })
        )

        this.jsonDataFiles = result
    }

    private async _executeSql(sql: string, params: Record<string, any>): Promise<Record<string, any>[]> {
        const data = Object.assign({}, params.page, params.request.params, params.request.query, params.request.body)
        const stmt = this.sqliteDatabase.prepare(sql)
        let result = []
        if (sql.trimLeft().toUpperCase().startsWith('SELECT')) {
            result = stmt.all(data)
        } else {
            result = [stmt.run(data)]
        }

        return result
    }

    async executeSql(sql: string, params: Record<string, any>): Promise<Record<string, any>[]> {
        if (!this.config.sqlite) {
            this.logging.info('Attempted execution of a SQL Statement, but "useSql" option in application configuration is deactivated. Statement has not been executed.')
            return []
        } else {
            try {
                return await this._executeSql(sql, params)
            } catch (e) {
                this.logging.error('SQL Error', e)
                return [{ error: 'SQL Error' }]
            }
        }
    }
    private async loadSqlData(): Promise<void> {
        const path = this.fileUtils.fullPath(this.config.sqliteFilename, this.config.path)
        this.sqliteDatabase = new SqliteDatabase(path)//, { verbose: console.log }) //TODO: proper Logging
    }

    async parseAndExecuteSql(obj: Record<string, any>, params: Record<string, any>): Promise<Record<string, any>> {
        if (!hasKeys(obj)) {
            return obj
        }

        if (!Object.keys(obj).includes('query')) {
            await Promise.all(Object.keys(obj).map(async key => {
                obj[key] = await this.parseAndExecuteSql(obj[key], params)
            }))
            return obj
        }

        const resultType: ResultType =
            obj['result'] && AllResultTypes.includes(obj['result'])
                ? obj['result']
                : 'mixed'

        const sqlResult = await this.executeSql(obj['query'], params)

        if (resultType === 'array') {
            return sqlResult
        }

        const objResult = isDefined(sqlResult) && isDefined(sqlResult[0])
            ? Object.keys(sqlResult[0]).reduce(
                (acc, key) => {
                    acc[`_${key}`] = sqlResult[0][key]
                    return acc
                }
                , {})
            : {}

        if (resultType === 'object') {
            return objResult
        }

        const mixedResult = Object.assign(sqlResult, objResult)
        return mixedResult
    }

    private async loadGlobalData(): Promise<void> {
        const fileExists = await this.fileUtils.exist('global.json')
        this.globalData = fileExists
            ? await this.fileUtils.readJson<Record<string, any>>('global')
            : {}
        this.globalData = this.parseAndExecuteSql(this.globalData, {})
    }

    async load(): Promise<void> {
        await this.loadJsonData()
        await this.loadSqlData()
        await this.loadGlobalData()

        this.database = new Database(this.loadJson, this.saveJson, this.executeSql)
    }

    async save(): Promise<void> {
        await Promise.all(
            Object.keys(this.jsonDataFiles).map(async (filename) => {
                await this.fileUtils.writeJson(this.jsonDataFiles[filename], filename, 'data')
            })
        )
    }

    async getDatabase(): Promise<IDatabase> {
        if (this.config.reloadOnEveryRequest) {
            await this.load()
        }
        return this.database
    }

    async getGlobalData(): Promise<GlobalData> {
        if (this.config.reloadOnEveryRequest) {
            await this.loadGlobalData()
        }

        return this.globalData
    }
}