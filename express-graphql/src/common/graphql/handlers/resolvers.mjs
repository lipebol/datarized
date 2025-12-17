import { Controllers } from '../../controllers.mjs'

class Resolvers {

    static create() {
        return {
            async spotifyAPI(args, context, info) {
                return await Controllers.multi(
                    Resolvers.handler(args, context, info)
                )
            },
            async spotifExArtists(args, context, info) {
                return await Controllers.multi(
                    Resolvers.handler(args, context, info)
                )
            },
            async spotifExAlbums(args, context, info) {
                return await Controllers.multi(
                    Resolvers.handler(args, context, info)
                )
            },
            async spotifExTracks(args, context, info) {
                return await Controllers.multi(
                    Resolvers.handler(args, context, info)
                )
            },
            async spotifExDaylists(args, context, info) {
                return await Controllers.multi(
                    Resolvers.handler(args, context, info)
                )
            }
        }
    }

    static handler(args, context, info) {
        return {
            headers: context.headers,
            filter: Object.keys(args)[0].toString(),
            params: Object.values(args)[0],
            page: args.page, info: args.info, lookup: args.lookup,
            about: {
                resolver: info.fieldName,
                type: info.returnType.ofType.name
                    .replace('_', ''),
                fields: info.fieldNodes,
            }
        }
    }
}

export const resolvers = Resolvers.create()