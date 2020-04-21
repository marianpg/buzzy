'use strict'

import { RoutingConfig } from '../../public/config'

import { GlobalData } from '../../public/global'
import { RequestData, RequestParams } from '../../public/request'
import { SessionData } from '../../public/session'
import { PageRoute } from '../../public/route'

import { Logging } from '../logging'
import { FileUtils } from '../filesystem-utils'

import { RenderEngine } from '../render-engine'
import { Validator } from '../validator'
import { determineFilepath } from '../route'


export class HtmlService {

    constructor(
        private config: RoutingConfig,
        private logging: Logging,
        private fileUtils: FileUtils,
        private renderEngine: RenderEngine,
        private validator: Validator
    ) { }

    async validate(html: string): Promise<[boolean, string]> {
        try {
            const validation = await this.validator.validate(html)
            if (validation.results.length > 0) {
                const errorHtml = await this.renderEngine.renderValidationError(validation, html)
                return [false, errorHtml]
            } else {
                return [true, html]
            }
        } catch (error) {
            const errorHtml = await this.renderEngine.renderAnyError(error, html)
            return [false, errorHtml]
        }
    }

    private parsePagePath(route: PageRoute, params: RequestParams): string {
        return determineFilepath(route.page, params)
    }

    async parsePage(ressource: string | PageRoute, globalData: GlobalData, request: RequestData, session: SessionData): Promise<string> {
        await this.renderEngine.reloadRenderer()

        const pagePath = typeof ressource === 'string'
            ? ressource
            : this.parsePagePath(ressource, request.params)

        return await this.renderEngine.renderPage(pagePath, globalData, request, session)
    }

    async parseTemplate(ressource: string | PageRoute, globalData: GlobalData, request: RequestData, session: SessionData): Promise<string> {
        await this.renderEngine.reloadRenderer()

        const pagePath = typeof ressource === 'string'
            ? ressource
            : this.parsePagePath(ressource, request.params)

        return await this.renderEngine.renderTemplate(pagePath, globalData, request, session)
    }
}