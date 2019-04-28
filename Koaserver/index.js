const Websocket = require("ws");
const host = process.env.host || '127.0.0.1';
const port = process.env.port || '3000';
const wss = new Websocket.Server({
    host,
    port
});

const testklinearr = []; //TODO: 默认推送600条数组数据
function createklinedata(resolutioninfo, timestamp, from, to){
    let obj = Object.create(null);
    obj = {
        date: from * 1000,
        dateEnd: to * 1000,
        symbol: 'GXC/USDT',
        period: resolutioninfo,
        open: parseFloat((Math.random() * (10-5) + 5).toFixed(4)),
        close: parseFloat((Math.random() * (10-5) + 5).toFixed(4)),
        high: parseFloat((Math.random() * (10-5) + 5).toFixed(4)),
        low: parseFloat((Math.random() * (10-5) + 5).toFixed(4)),
        volume: parseFloat((Math.random() * (1000-10) + 10).toFixed(4)),
        time: timestamp * 1000,
        isEnd: false,
        amount: parseFloat((Math.random() * (16000-8000) + 8000).toFixed(4))
    }
    return obj;
}

wss.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress; //TODO: 客户端IP地址
    console.log(`${ip} Joined successfully`);
    ws.on('message', function incoming(message){
        let requestparams = JSON.parse(message);
        if(requestparams.pong){ //TODO: 心跳检测
            ws.send(JSON.stringify({
                type: 'ping',
                value: Date.now()
            }));
        }else{ //TODO: 其他消息推送
            switch (requestparams.type) {
                case "subSymbolinfo": //TODO: 订阅币种信息
                {
                    let responsedata =  {
                        type: 'subSymbolinfo',
                        topic: requestparams.value, //TODO: market.GXC/USDT.resolveSymbol
                        timestamp: Date.now(), //TODO: 时间戳
                        data:{
                            base_name: ["GXC-USDT"], //TODO: 返回：GXC-USDT(对应币种-市场)
                            data_status: "streaming", 
                            description: "GXC-USDT,LongBit", //TODO: 返回：GXC-USDT(对应币种-市场)，交易名称
                            exchange: "LongBit", //TODO: 返回：交易所略称
                            full_name: "GXC-USDT", //TODO: 返回：GXC-USDT(对应币种-市场)
                            has_intraday: true,
                            intraday_multipliers: ["1S", "1", "5", "15", "30", "60", "240"],
                            legs: "GXC-USDT", //TODO: 返回：GXC-USDT(对应币种-市场)
                            minmov: 1,
                            name: "LongBitGXC-USDT", //TODO: 返回：交易所略称GXC-USDT(对应币种-市场)
                            pricescale: 100000,
                            pro_name: "GXC-USDT", //TODO: 返回：GXC-USDT(对应币种-市场)
                            session: "24x7",
                            supported_resolutions: ["1S", "1", "5", "15", "30", "60", "240", "1D", "5D", "1W", "1M"],
                            ticker: "LongBit:GXC-USDT", //TODO: 返回：交易所略称:GXC-USDT(对应币种-市场)
                            timezone: "Asia/Shanghai", 
                            type: "crypto",
                            volume_precision: 5 //TODO: 成交量数字的小数位，例：返回5位小数精度
                        }
                    }
                    ws.send(JSON.stringify(responsedata));
                };
                break;
                case 'getBars':  //TODO: 订阅K线消息
                {
                    let requestvalue = requestparams.value;
                    let totallimit = Math.floor( (requestvalue.to - requestvalue.from) / (parseInt(requestvalue.resolution) * 60) );
                    let resolutionseconds = parseInt(requestvalue.resolution) * 60;
                    if(!testklinearr.length){
                        for(let i = totallimit - 600 ; i < totallimit; i++){
                            testklinearr.push(createklinedata(requestvalue.resolutioninfo, (requestvalue.from + resolutionseconds * i), requestvalue.from, requestvalue.to));
                        }
                    }
                    let responsedata = {
                        type: "getBars",  //TODO: 新增type类型
                        topic: "market.gxcbtc.kline.15",
                        timestamp: Date.now(),
                        data: testklinearr
                    }
                    ws.send(JSON.stringify(responsedata));
                };
                break;
                case "subscribeBars": //TODO: 订阅K线
                {
                    let requestvalue = requestparams.value;
                    setInterval(() => {
                        let now = Math.floor(Date.now() / 1000);
                        let newdata = createklinedata(requestvalue.resolutioninfo, parseInt(testklinearr[testklinearr.length-1].time/ 1000) , testklinearr[testklinearr.length-1].time, testklinearr[testklinearr.length-1].time);
                        let responsedata = {
                            type: "subscribeBars",  //TODO: 新增type类型
                            topic: requestvalue.resolutioninfo,
                            timestamp: Date.now(),
                            data: newdata
                        }
                        if(ws.readyState == 1){
                            ws.send(JSON.stringify(responsedata));
                        }
                    }, 2000);
                };
                break;
                default:
                break;
            }
        }
    });
});