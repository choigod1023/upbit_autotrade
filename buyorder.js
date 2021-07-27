const uuidv4 = require('uuid').v4
const sign = require('jsonwebtoken').sign
const crypto = require('crypto')
const queryEncode = require("querystring").encode
const request = require('request-promise-native')
const access_key = "phd5U6LRXDGUBkeNcwDJw1JCcDm2mqv6M5fQGExl"
const secret_key = "aIHYoDFKWB649d7eduBzaoHjROLYV2FLeKlyEWn0"
const server_url = "https://api.upbit.com"

module.exports = {
    buy_order: async function (market, balance) {
        const options = {
            method: "GET",
            url: server_url + '/v1/candles/minutes/1?market=' + market + '&count=1',
            headers: {
                'Accept': 'application/json'
            },
        }
        return request(options).then((result) => {
            var candle_body = JSON.parse(result)[0]
            price = candle_body.trade_price
            console.log(price)
            var vol = parseInt(balance).toFixed(2)
            var volume = parseInt((vol / price).toFixed(2))
            const body = {
                market: market,
                side: 'bid',
                ord_type: 'limit',
                volume: volume,
                price: price,
            }

            const query = queryEncode(body)

            const hash = crypto.createHash('sha512')
            const queryHash = hash.update(query, 'utf-8').digest('hex')

            const payload = {
                access_key: access_key,
                nonce: uuidv4(),
                query_hash: queryHash,
                query_hash_alg: 'SHA512',
            }

            const token = sign(payload, secret_key)

            const options = {
                method: "POST",
                url: server_url + "/v1/orders",
                headers: { Authorization: `Bearer ${token}` },
                json: body
            }
            return options
        })
    }
}