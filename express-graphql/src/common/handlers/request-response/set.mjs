import { Op } from 'sequelize'
import { ParamsHandler } from "./params.mjs"
import { Externals } from './externals.mjs'

export class SetHandler {

    constructor(request, response) {
        try {
            this.handler = {
                ...ParamsHandler.check(request),
                response: response,
            }
        } catch (err) { console.log(err) }
    }

    external() {
        if (!this.handler.authExternal || this.handler.authExternal === '') {
            this.handler.data = { error: { name: 'Unauthorized', status_code: 401 } }
        }
        return this
    }

    fields() {
        try {
            if (this.handler.about?.fields && !this.handler.data?.error) {
                this.handler.fields = new Array()
                const unwrap = (content) => {
                    return (
                        Array.isArray(content) ? content[0] : content
                    ).selectionSet?.selections
                }

                unwrap(this.handler.about.fields).forEach(
                    (node) => {
                        let nodename = node.typeCondition?.name.value
                        if (nodename === this.handler.about.type) {
                            this.handler.fields.push(
                                ...unwrap(unwrap(node))
                                    .map(selection => selection.name.value)
                            )
                        } else if (!['Errors', 'Info'].includes(nodename)) {
                            this.handler.fields.push(
                                ...unwrap(node)
                                    .map(selection => selection.name.value)
                            )
                        }
                    }
                )
            }
            return this
        } catch (err) { console.log(err) }
    }

    lookup(...args) {
        try {
            if (this.handler.lookup) {
                if (args && !this.handler.data?.error) {
                    this.handler.lookup = args.length === 1 ?
                        args[0] : { path: args[0], populate: args[1] }
                }
            }
            return this
        } catch (err) { console.log(err) }
    }

    page() {
        try {
            if (this.handler.page && !this.handler.data?.error) {
                this.handler.page = parseInt(this.handler.page) <= 0 ? 1 :
                    parseInt(this.handler.page)
                this.handler.offset = (this.handler.page - 1) * this.handler.limit
            }
            return this
        } catch (err) { console.log(err) }
    }

    sql() {
        try {
            if (!this.handler.data?.error) {
                this.handler.db = 'sql'
                this.handler.sql = {
                    limit: this.handler.limit, offset : this.handler.offset
                }
                if (this.handler.filter && this.handler.params) {
                    this.handler.sql.order = [[this.handler.filter, 'ASC']]
                    this.handler.sql.where = (() => {
                        if (this.handler.paramsType === 'dates') {
                            const [start, end] = this.handler.params
                            return {
                                [this.handler.filter]: {
                                    [Op.between]: [new Date(start), new Date(end)]
                                }
                            }
                        }
                        return { [this.handler.filter]: { [Op.in]: this.handler.params } }
                    })()
                }
                if (!this.handler.info && this.handler.fields) {
                    this.handler.sql.attributes = this.handler.fields 
                }
            }
            return this
        } catch (err) { console.log(err) }
    }

    nosql() {
        try {
            if (!this.handler.data?.error) {
                this.handler.db = 'nosql'
                if (this.handler.filter && this.handler.params) {
                    this.handler.where = (() => {
                        return this.handler.paramsType === 'multi' ?
                            { [this.handler.filter]: { '$in': this.handler.params } } :
                            {
                                [this.handler.filter]:
                                {
                                    '$gte': new Date(this.handler.params.start),
                                    '$lte': new Date(this.handler.params.end)
                                }
                            }
                    })()
                }
            }
        } catch (err) { console.log(err) }
    }

    async build() {
        try {
            if (this.handler.authExternal && !this.handler.data?.error) {
                this.handler.data = await Externals.initialize(this.handler)
            }
            return this.handler
        } catch (err) { console.log(err) }
    }
}