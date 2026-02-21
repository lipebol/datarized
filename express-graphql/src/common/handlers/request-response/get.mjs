import { SetHandler } from './set.mjs'

export class GetHandler {

    static create(request, response) {
        try {
            const handler = new SetHandler(request, response)
            return request.route ?
                GetHandler.#REST(handler) :
                GetHandler.#GraphQL(handler, request.about.resolver)
        } catch (err) { console.log(err) }
    }

    static response(handler) {
        try {
            if (handler.response) {
                this.status = parseInt(
                    process.env[Object.keys(data).toString().toUpperCase()]
                )
                return response.status(this.status ? this.status : 200).json(data)
            } else {
                // __typename: --> essential when you deal with unions/interfaces
                if (handler.data?.error) {
                    return {
                        __typename: 'Errors', error: handler.data.error.name,
                        message: process.env[handler.data.error.name],
                        status_code: handler.data.error.status_code
                    }
                }
                return !handler.data.__typename ? {
                    __typename: handler.about.type,
                    data: Array.isArray(handler.data) ?
                        handler.data : [handler.data]
                } : handler.data
            }
        } catch (err) { console.log(err) }
    }

    static #REST(handler) {
        try {
            let [version, name, table, column] = set.url(request.originalUrl)
            sethandler.model({ name, table })
            if (request.query && column) {
                sethandler.filter({ name, column })
                sethandler.query(request.query)
                if (request.query.page) {
                    sethandler.page(request.query.page)
                } else { sethandler.count() }
            }
            return sethandler.finally()
        } catch (err) { console.log(err) }
    }

    static async #GraphQL(handler, resolvername) {
        try {
            switch (resolvername) {
                case 'DivvyBikes':
                    handler
                        .page()
                        .fields()
                        .sql()
                    break
                case 'spotifExArtists':
                    handler
                        .page()
                        .lookup('genres')
                        .nosql()
                    break
                case 'spotifExAlbums':
                    handler
                        .fields()
                        .nosql()
                    break
                case 'spotifExTracks':
                    handler
                        .lookup('artist', { path: 'genres' }) // tracks.artists.genres
                        .nosql()
                    break
                case 'spotifExDaylists':
                    handler
                        .lookup('track', ['album', 'artists.genres'])
                        .fields()
                        .nosql()
                    break
                default:
                    handler.external().fields()
            }
            return await handler.build()
        } catch (err) { console.log(err) }
    }
}