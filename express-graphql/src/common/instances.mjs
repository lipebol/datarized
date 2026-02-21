import { cryptHandler } from './handlers/crypt.mjs'

const [postgresql, mongodb, s3] = ['postgresql-uri.jwe','mongodb-uri.jwe','s3.jwe']
// ========================================= mongoose =========================================
import { mongoose } from 'mongoose'

mongoose.set(
    'debug', (collection, method, query, agreggate, options) => {
        console.log(
            JSON.stringify(
                { collection, method, query, agreggate, options }, null, 2
            )
        )
    }
)

export const mongooseAddons = { 
    collation: { locale: 'en', strength: 2 }, versionKey: false, 
    toJSON: { virtuals: true }, toObject: { virtuals: true }
}

export const mongooseSpotifEx = mongoose.createConnection(cryptHandler(mongodb)).useDb('spotifEx')


// ========================================= Sequelize =========================================
import { Sequelize } from 'sequelize'

export const sequelizeConnect = new Sequelize(cryptHandler(postgresql), { dialect: 'postgres' })


// ====================================== Object Storage =======================================
import { S3Client } from '@aws-sdk/client-s3'

const [s3endpoint, access_key, secret_key] = cryptHandler(s3).split(' ')

export const s3connect = new S3Client(
    {
        region: 'us-east-1', endpoint: s3endpoint, forcePathStyle: true,
        credentials: { accessKeyId: access_key, secretAccessKey: secret_key }
    }
)