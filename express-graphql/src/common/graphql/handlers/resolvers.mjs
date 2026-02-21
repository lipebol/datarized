import { Controllers } from '../../controllers.mjs'
import { parseResolveInfo } from 'graphql-parse-resolve-info'

class Resolvers {

    static create() {
        return {
            async DivvyBikes(args, context, info) {
                return await Controllers.dates(
                    Resolvers.handler(args, context, info)
                )
            },
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
            async spotifExDaylists(_, context, info) {
                return await Controllers.multi(Resolvers.handler(context, info))
            }
        }
    }

    static handler(context, info) {
        const { args, fieldsByTypeName } = parseResolveInfo(info)
        const isbetween = 'between' in args
        let config = {
            headers: context?.headers, params: isbetween ? args.between : Object.values(args)[0],
            filter: isbetween ? { between: args.by } : Object.keys(args)[0].toString(),
            ...args, about: {
                resolver: info.fieldName, type: info.returnType.ofType.name.replace('_','')
            }, arrow: !context?.headers?.referer?.includes('tool') ? args.arrow : false
        }

        config.fields = { selections: fieldsByTypeName[config.about.resolver]?.data }
        if (!config.fields.selections) {
            config.fields.selections = fieldsByTypeName[`${config.about.type}Fields`]
        }

        return config
    }
}

export const resolvers = Resolvers.create()