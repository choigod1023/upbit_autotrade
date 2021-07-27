const buyorder = require('./buyorder.js')
const sellorder = require('./sellorder.js')
const otherorder = require('./otherorder.js')
const uuidv4 = require('uuid').v4
const sign = require('jsonwebtoken').sign
const crypto = require('crypto')
const queryEncode = require("querystring").encode
const request = require('request-promise-native')
const access_key = "phd5U6LRXDGUBkeNcwDJw1JCcDm2mqv6M5fQGExl"
const secret_key = "aIHYoDFKWB649d7eduBzaoHjROLYV2FLeKlyEWn0"
const server_url = "https://api.upbit.com"



function app() {

    let buy_price;
    let currency;
    let sell_balance;
    options = otherorder.account_payload_options()

    new Promise((resolve, reject) => {
        request(options).then((body) => {
            var account_info = JSON.parse(body)
            resolve(account_info)
        })
    }).then(arg => {
        try {
            buy_price = arg[1].avg_buy_price;
            sell_balance = arg[1].balance;
            currency = 'KRW-' + arg[1].currency
            query = 'market=' + currency
            const options = otherorder.order_payload_options('orders/chance?', currency)
            return request(options)
        }
        catch (error) {
            sellorder.select_market().then(result => {
                console.log(arg)
                KRW_account = arg[0].balance
                var markets = JSON.parse(result).markets
                var random = otherorder.rand(0, markets.length - 1)
                currency = markets[random].code.split('.')[2]
                console.log(currency)
                buyorder.buy_order(currency, KRW_account).then(result => {
                    console.log(result)
                    options = result

                    return request(options)
                });
            })

        }

    }).then(body => {
        const options = {
            method: "GET",
            url: server_url + '/v1/candles/minutes/1?market=' + currency + '&count=1',
            headers: {
                'Accept': 'application/json'
            },
        }
        return request(options)
    }).then(body => {

        var candle_body = JSON.parse(body)[0]
        var buy_rate = (candle_body.trade_price - buy_price) / candle_body.trade_price * 100
        console.log(buy_rate)
        console.log(sell_balance)
        if (buy_rate <= -3.5 || buy_rate >= 5.0) {
            const options = sellorder.sell_order(currency, sell_balance)
            return request(options)
        }
    }).then(body => {
        console.log(body)

    })

}

setInterval(app, 1000)