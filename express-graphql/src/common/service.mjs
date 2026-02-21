import * as models from './models.mjs'
import * as arrow from './arrow-copy.mjs'

export class Service {

    static async sql(handler) {
        try {

            const data = handler.info ?
                await models[handler.about.type].count(handler.sql) :
                await models[handler.about.type].findAll(handler.sql)

            return !data ?
                { error: { name: 'NotFound', status_code: 404 } } :
                !handler.info ? data : {
                    count: data, countpages: Math.ceil(
                        parseFloat(data) / handler.limit
                    ), columns: Object.keys(
                        models[handler.about.type].rawAttributes
                    )
                }
        } catch (err) { console.log(err) }
    }


    static async nosql(handler) {
        try {

            const ndocs = await models[handler.about.type]
                .countDocuments(handler.where)

            if (!ndocs) { return { error: { name: 'NotFound', status_code: 404 } } }
            else if (handler.info) { return Service.info(ndocs, handler.limit, []) }
            else if (handler.arrow) {
                const cursor = models[handler.about.type]
                    .find(handler.where).sort({ [handler.filter]: 'asc' })
                    .select(handler.fields).populate(handler.lookup)
                    .lean().cursor({ batchSize: handler.limit })

                let [mount, batch, table] = [
                    (table, batch) => {
                        const data = arrow[handler.about.type](batch)
                        if (!table) { return data } return table.concat(data)
                    }, [], null
                ]

                if (ndocs > handler.limit) {
                    for await (const data of cursor) {
                        batch.push(data)
                        if (batch.length === handler.limit) {
                            [table, batch] = [mount(table, batch), []]
                        }
                    }
                } else { for await (const data of cursor) { batch.push(data) } }

                if (batch.length > 0) { table = mount(table, batch) }

                return await arrow.load(
                    handler.about.type, arrow.hashed(handler),
                    arrow.serialize(table)
                )
            } else {
                return await models[handler.about.type]
                    .find(handler.where).sort({ [handler.filter]: 'asc' })
                    .select(handler.fields).skip(handler.offset)
                    .limit(handler.limit).populate(handler.lookup).exec()
            }
        } catch (err) { console.log(err) }
    }

    static info(count, limit, cols) {
        return {
            __typename: 'Info', total: count, columns: cols,
            pages: Math.ceil(parseFloat(count) / limit)
        }
    }
}