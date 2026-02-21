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

    lookup(...args) {
        try {
            if (this.handler.lookup) {
                if (args && !this.handler.data?.error) {

                    const [parent, childs] = args

                    const createpath = (value) => {
                        return { select: this.handler.arrow ? '-_id ' : '', path: value }
                    }

                    this.handler.lookup = createpath(parent)

                    if (childs.length > 1) {
                        this.handler.lookup.populate = new Array()
                        for (const child of childs) {
                            if (child.includes('.')) {
                                const [parent, childin] = child.split('.')
                                this.handler.lookup.populate.push(
                                    { ...createpath(parent), populate: createpath(childin) }
                                )
                            } else {
                                this.handler.lookup.populate.push(createpath(child))
                            }
                        }
                    }
                }
            }
            return this
        } catch (err) { console.log(err) }
    }

    fields() {
        try {
            if (this.handler.fields?.selections && !this.handler.data?.error) {
                const fieldsByTypeName = (content) => { return content?.fieldsByTypeName }
                const getTypeName = (content) => {
                    let TypeName = Object.keys(content)
                    if (TypeName.length > 1) {
                        TypeName = TypeName.filter(type => type.includes('Fields'))
                    }
                    return TypeName.toString()
                }

                let parent = fieldsByTypeName(this.handler.fields.selections)
                let parentfields = parent[getTypeName(parent)]
                this.handler.fields = Object.keys(parentfields)

                if (this.handler.arrow) { this.handler.fields.push('-_id') }

                if (this.handler.lookup) {

                    const setFields = (content) => { return Object.keys(content).join(' ') }
                    const getPath = (content) => { return content?.path }

                    parent = fieldsByTypeName(parentfields[getPath(this.handler.lookup)])
                    if (parent) {
                        parentfields = parent[getTypeName(parent)]
                        const parentchilds = this.handler.lookup?.populate
                        if (Array.isArray(parentchilds)) {
                            this.handler.lookup.populate = new Array()
                            for (const child of parentchilds) {
                                let childfields = parentfields[getPath(child)]
                                if (childfields) {
                                    childfields = fieldsByTypeName(childfields)
                                    child.select += setFields(childfields[getTypeName(childfields)])
                                    this.handler.lookup.populate.push(child)
                                }
                            }
                        }
                        this.handler.lookup.select += setFields(parentfields)
                    } else { this.handler.lookup = parent }
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
                    limit: this.handler.limit, offset: this.handler.offset
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