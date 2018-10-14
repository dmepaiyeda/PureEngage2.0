const url = require('url');
const EventEmitter = require('events');
const logger = require('winston');

const CookieJar = require('cookiejar').CookieJar;
const cometDLib = require('cometd');
require('./cometd-nodejs-client').adapt();

class Notifications extends EventEmitter {
    constructor(apiKey, endpointUrl) {
        super();
        
        this.apiKey = apiKey;
        this.endpointUrl = endpointUrl;
        this.cometd = new cometDLib.CometD();
    }
    
    initialize(token, channels = [], cookieJar = new CookieJar(), cometdConfiguration = {}) {
        const cometd = this.cometd;
        logger.debug(`Initializing (token: ${token}, channels: ${channels})`);
        
        return new Promise((resolve, reject) => {
            const hostname = url.parse(this.endpointUrl).hostname;
            const transport = cometd.findTransport('long-polling');
            transport.context = {
                cookieJar: cookieJar
            };

            // Set default headers
            cometd.configure({
                url: this.endpointUrl,
                requestHeaders: {
                    'x-api-key': this.apiKey,
                    Authorization: `Bearer ${token}`
                }
            });

            // Apply user defined configuration
            if (cometdConfiguration && Object.keys(cometdConfiguration).length !== 0) {
                cometd.configure(cometdConfiguration);
            }
            cometd.handshake(reply => {
                if(reply.successful) {
                    logger.debug('Handshake successful');
                    
                    channels.forEach(channel => {
                        cometd.subscribe(channel, msg => {
                            logger.debug(msg);
                            const data = msg.data;
                            this.emit(channel, data);
                        }, result => {
                            if(result.successful) {
                                logger.debug(`Successfully subscribed: ${channel}`);
                            } else {
                                reject(`Cannot subscribe: ${channel}`);
                            }
                        });
                    });
                    
                    resolve();
                }
          });
      });
    }
    
    finalize() {
        this.cometd.disconnect();
    }
};

module.exports = Notifications;