const uuidv4 = require('uuid').v4
const sign = require('jsonwebtoken').sign
const crypto = require('crypto')
const queryEncode = require("querystring").encode
const request = require('request-promise-native')
const access_key = "phd5U6LRXDGUBkeNcwDJw1JCcDm2mqv6M5fQGExl"
const secret_key = "aIHYoDFKWB649d7eduBzaoHjROLYV2FLeKlyEWn0"
const server_url = "https://api.upbit.com"

module.exports = {
    select_market: async function () {
        return request('https://crix-api-cdn.upbit.com/v1/crix/trends/weekly_change_rate?count=10')
    },
    sell_order: function (market, balance) {
        const body = {
            market: market,
            side: 'ask',
            volume: balance,
            ord_type: 'market',
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

    }
}
