import { mongoose } from 'mongoose'
import { mongooseAddons, mongooseSpotifEx } from './instances.mjs'

export const spotifExGenres = mongooseSpotifEx.model(
    'spotifExGenres', new mongoose.Schema(
        {
            _id: { type: mongoose.ObjectId, required: true },
            name: { type: String, required: true },
            about: { type: String, required: true }
        }, mongooseAddons
    ), 'genres'
)

export const spotifExArtists = mongooseSpotifEx.model(
    'spotifExArtists', (
        () => {
            const schema = new mongoose.Schema(
                {
                    _id: { type: mongoose.ObjectId, required: true },
                    artistid: { type: String, required: true },
                    name: { type: String, required: true },
                    profile: { type: String, required: true },
                    followers: { type: Number, required: true },
                    images: [
                        {
                            url: { type: String, required: true },
                            width: { type: Number, required: true },
                            height: { type: Number, required: true },
                        }
                    ],
                    genres: [{ type: mongoose.ObjectId, ref: 'spotifExGenres' }]
                }, mongooseAddons
            )
            schema.virtual('__typename').get(() => { return 'spotifExArtistFields' })
            return schema
        }
    )(), 'artists'
)


export const spotifExAlbums = mongooseSpotifEx.model(
    'spotifExAlbums', (
        () => {
            const schema = new mongoose.Schema(
                {
                    _id: { type: mongoose.ObjectId, required: true },
                    albumid: { type: String, required: true },
                    name: { type: String, required: true },
                    album_type: { type: String, required: true },
                    release_date: { type: String, required: true },
                    available_markets: [{ type: String, required: true }],
                    no_available_markets: [{ type: String, required: true }],
                    external_url: { type: String, required: true },
                    images: [
                        {
                            url: { type: String, required: true },
                            width: { type: Number, required: true },
                            height: { type: Number, required: true },
                        }
                    ],
                    total_tracks: { type: Number, required: true },
                    copyrights: [
                        {
                            text: { type: String, required: true },
                            type: { type: String, required: true },
                        }
                    ],
                    label: { type: String, required: true }
                }, mongooseAddons
            )
            schema.virtual('__typename').get(() => { return 'spotifExAlbumFields' })
            return schema
        }
    )(), 'albums'
)


export const spotifExTracks = mongooseSpotifEx.model(
    'spotifExTracks', new mongoose.Schema(
        {
            _id: { type: mongoose.ObjectId, required: true },
            trackid: { type: String, required: true },
            name: { type: String, required: true },
            album: { type: mongoose.ObjectId, ref: 'spotifExAlbums' },
            artists: [{ type: mongoose.ObjectId, ref: 'spotifExArtists' }],
            url: { type: String, required: true },
            duration_ms: { type: Number, required: true },
            popularity: { type: Number, required: true },
            explicit: { type: Boolean, required: true },
            track_number: { type: Number, required: true },
            disc_number: { type: Number, required: true },
            isrc: { type: String, required: true }
        }, mongooseAddons
    ), 'tracks'
)

export const spotifExDaylists = mongooseSpotifEx.model(
    'spotifExDaylists', new mongoose.Schema(
        {
            _id: { type: mongoose.ObjectId, required: true },
            track: { type: mongoose.ObjectId, ref: 'spotifExTracks' },
            date: { type: String, required: true },
            listen: { type: Number, required: true }
        }, mongooseAddons
    ), 'daylists'
)