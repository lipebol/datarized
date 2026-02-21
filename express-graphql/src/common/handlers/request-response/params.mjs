import { cryptHandler } from '../crypt.mjs'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'


export class ParamsHandler {

    static check(handler) {
        [
            handler.paramsType,
            handler.params,
            handler.authExternal,
            handler.regex,
            handler.lookup,
            handler.limit
        ] = ParamsHandler.set(handler)
        if (handler.params) {
            switch (handler.paramsType) {
                case 'dates':
                    handler.params = (() => {
                        if (
                            handler.params.includes('') ||
                            handler.params.length !== 2) { return 'invalid' }
                        else {
                            dayjs.extend(customParseFormat)
                            let validator = new Array()

                            handler.params.forEach(
                                (value) => {
                                    /// --- 'true', it won't carry over to the next month. ---
                                    let resDayJs = dayjs(value, 'YYYY-MM-DD', true)
                                    if (String(resDayJs.$d) === 'Invalid Date') {
                                        /// ------ for custom message ------
                                        // if (String(resDayJs.$y) === String(resDayJs.$M)) {
                                        //     validator.push('INVALID_FORMAT')
                                        // } else { validator.push('INVALID_DATE') }
                                        /// --------------------------------
                                        validator.push(false)
                                    } else { validator.push(true) }
                                }
                            )

                            if (
                                validator.filter((date) => date !== true).length > 0 ||
                                dayjs(handler.params[0])
                                    .isAfter(dayjs(handler.params[1]))
                            ) { return 'invalid' }

                            handler.params[1] = handler.params[1].concat(' ', '23:59:59')
                            handler.filter = handler.filter?.between
                            return handler.params
                        }
                    })()
                    break
                case 'multi':
                    handler.params = (() => {
                        switch (handler.filter) {
                            default:
                                return ['trackid', 'albumid', 'artistid', 'track', 'name', 'date']
                                    .includes(handler.filter) ?
                                    ParamsHandler.sanitize(handler) : 'invalid'
                        }
                    })()
                    break
            }
            if (handler.params.includes('invalid')) {
                handler.data = { error: { name: 'BadRequest', status_code: 400 } }
            }
        }
        return handler
    }

    static set(handler) {
        return [
            handler.filter?.between ? 'dates' : 'multi',
            handler.params === '*' ?
                undefined : handler.params.split('|'),
            !handler.headers.authexternal ? undefined :
                cryptHandler(handler.headers.authexternal),
            handler.params.includes('*') ? true : false,
            handler.lookup || false, /// in "Query"
            10000
        ]
    }

    static sanitize(handler) {
        return handler.params.map(
            param => {
                const [infirst, inlast] = [param.startsWith('*'), param.endsWith('*')]
                param = param.replaceAll('*', '')
                return process.env.BAD_CHARACTERS.split('0')
                    .some(character => param.includes(character))
                    ? 'invalid' : handler.regex ?
                        new RegExp(
                            (infirst && !inlast) ?
                                param + '$' : (!infirst && inlast) ?
                                    '^' + param : param, 'i'
                        ) : param
            }
        )
    }
}