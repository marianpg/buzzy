'use strict'

import { SqlDataConfig } from "../../public/config/database-config"
import { Database as IDatabase, ResultType, AllResultTypes } from "../../public/database"

const SqliteDatabase = require('better-sqlite3')

import { Logging } from "../logging"
import { FileUtils } from "../filesystem-utils"
import { hasKeys, isDefined } from "../helper"


export class SqlDataService {

    private sqliteDatabase: any

    constructor(
        private config: SqlDataConfig,
        private logging: Logging,
        private fileUtils: FileUtils
    ) { }

    private async _build(): Promise<void> {
        const path = this.fileUtils.fullPath(this.config.pathToFile)
        //TODO: proper Logging
        this.sqliteDatabase = new SqliteDatabase(path)//, { verbose: console.log })
    }

    async build(): Promise<SqlDataService> {
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

    async query(sql: string, params: Record<string, any>): Promise<Record<string, any>[]> {
        if (this.config.active) {
            try {
                return await this._executeSql(sql, params)
            } catch (err) {
                this.logging.error('SQL Error', err)
                return [{ message: 'SQL Error', error: err }]
            }
        } else {
            return []
        }
    }

    async parseAndExecuteSql(obj: Record<string, any>, params: Record<string, any>): Promise<Record<string, any>> {
        if (!this.config.active || !hasKeys(obj)) {
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

        const sqlResult = await this.query(obj['query'], params)

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
}