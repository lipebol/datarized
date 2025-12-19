import { cryptHandler } from '../crypt.mjs'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'


export class ParamsHandler {

    dates(request) {
        try {
            dayjs.extend(customParseFormat)
            this.params = request.params.dates.split(process.env.SEPARATOR)
            if (this.params) {
                this.params.forEach((value) => { if (value !== '') { this.hasparams.push(value) } })
            }
            return this.hasparams.length === 2 || this.params[0] === 'max' ? true : false
            if (this.params[0] === process.env.MAX) { request.params.dates = this.params[0] }
            else {
                this.params.forEach(
                    (value) => {
                        let resDayJs = dayjs(value, 'YYYY-MM-DD', true) /// <-- 'true', não passa para o próximo mês
                        if (String(resDayJs.$d) === 'Invalid Date') {
                            if (String(resDayJs.$y) === String(resDayJs.$M)) {
                                this.validator.push('INVALID_FORMAT')
                            } else { this.validator.push('INVALID_DATE') }
                        } else { this.validator.push(true) }
                    }
                )
                this.validator = this.validator.filter((i) => i !== true)
                if (this.validator.length === 0) {
                    if (dayjs(this.params[0]).isAfter(dayjs(this.params[1]))) { return 'END_DATE' }
                } else { return this.validator[0] }
            }
            return request
        } catch (err) { console.log(err) }
    }

    static check(handler) {
        [
            handler.now,
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
                    // tirado do service
                    // if (params.dates) {
                    //     [newObject.start, newObject.end] = params.dates.split(process.env.SEPARATOR)
                    //     newObject.end = newObject.end.concat(' ','23:59:00')
                    // }
                    break
                case 'multi':
                    handler.params = (() => {
                        switch (handler.filter) {
                            // case 'ref':
                            //     handler.params.forEach(
                            //         (value) => {
                            //             /// <-- 'true', não passa para o próximo mês
                            //             String(
                            //                 dayjs(value, 'YYYY-MM', true).$d
                            //             ) === 'Invalid Date' ?
                            //                 handler.validator.push('invalid') :
                            //                 handler.validator.push(value)
                            //         }
                            //     )
                            //     break
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
            dayjs().format('YYYY-MM-DD'),
            handler.between ? 'dates' : 'multi',
            handler.params === '*' ?
                undefined : handler.params.split('|'),
            !handler.headers.authexternal ? undefined :
                cryptHandler(handler.headers.authexternal),
            handler.params.includes('*') ? true : false,
            handler.lookup === undefined ? /// in "Query"
                true : handler.lookup,
            handler.info ? 0 : 100
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