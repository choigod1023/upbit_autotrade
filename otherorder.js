
const uuidv4 = require('uuid').v4
const sign = require('jsonwebtoken').sign
const crypto = require('crypto')
const queryEncode = require("querystring").encode
const request = require('request-promise-native')
const access_key = "phd5U6LRXDGUBkeNcwDJw1JCcDm2mqv6M5fQGExl"
const secret_key = "aIHYoDFKWB649d7eduBzaoHjROLYV2FLeKlyEWn0"
const server_url = "https://api.upbit.com"

module.exports = {
    account_payload_options: function () {
        const payload = {
            access_key: access_key,
            nonce: uuidv4(),
        }

        const token = sign(payload, secret_key)

        const options = {
            method: "GET",
            url: server_url + "/v1/accounts",
            headers: { Authorization: `Bearer ${token}` },
        }

        return options
    },
    rand: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },


    order_payload_options: function (route, market) {


        const body = {
            market: market
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
            method: "GET",
            url: server_url + "/v1/" + route + query,
            headers: { Authorization: `Bearer ${token}` },
            json: body
        }

        return options
    }
}