const url = require('url');
const EventEmitter = require('events');
const CookieJar = require('cookiejar').CookieJar;
const logger = require('winston');

const Notifications = require('./notifications');
const internal = require('./internal');

class Statistics extends EventEmitter {

    constructor(apiKey, baseUrl) {
        super();
        
        const apiUrl = `${baseUrl}/statistics/v3`;

        this.SERVICE_CHANGE_EVENT = "ServiceChange";
        this.UPDATES_EVENT = "Updates";

        this.apiKey = apiKey;
        this.apiUrl = apiUrl;        

        const client = new internal.ApiClient();
        client.enableCookies = true;
        client.basePath = apiUrl;
        this.client = client;
        
        this.api = new internal.StatisticsApi(client);
        this.cookieJar = client.agent.jar;
        this.notifications = new Notifications(apiKey, `${apiUrl}/notifications`);
    }
    
    
    /**
     *  Initialize the Statistics client library.
     * 
     * @param {string} token The authorization token you received during authentication by following the Authorization Code Grant flow.
     * @param {object} cometdConfiguration
     * @returns {Promise}
     */
    initialize(token, cometdConfiguration = {}) {
        logger.debug(`Initializing: ${token}`);
        
        this.client.defaultHeaders = {
            'x-api-key': this.apiKey,
            Authorization: `Bearer ${token}`
        };
        
        const serviceChannel = "/statistics/v3/service";
        const updatesChannel = "/statistics/v3/updates";
        const channels = [
          serviceChannel,
          updatesChannel
        ];

        // emit events, to subscribe them use events.on(EVENT_NAME, (data) => {});
        this.notifications.on(serviceChannel, data => this.emit(this.SERVICE_CHANGE_EVENT, data));
        this.notifications.on(updatesChannel, data => this.emit(this.UPDATES_EVENT, data));
        
        return this.notifications.initialize(token, channels, this.cookieJar, cometdConfiguration).then(() => this);
    }
    
    /**
     *  Delete the specified subscription by closing all its statistics.
     * 
     * @param {string} id The ID of the subscription to delete.
     * @returns {Promise}
     */
    deleteSubscription(id) {
        return this.api.deleteSubscription(id);
    }
    
    /**
     *  Open a subscription for the specified set of statistics.
     * 
     * @param {string} operationId A unique string (we recommend using a UUID/GUID) that the Statistics API uses as the subscriptionId.
     * @param {object[]} descriptors Definitions of the statistics to be monitored.
     * @param {boolean} verbose Specifies whether the Statistics API should return additional information about opened statistics in the response.
     * @returns {Promise}
     */
    createSubscription(operationId, descriptors = [], verbose = true) {
        const statistics = {
            operationId: operationId,
            data: {
                statistics: descriptors
            }
        };
        
        const opts = {
            verbose: verbose? 'INFO': 'OFF'
        };
        
        return this.api.createSubscription(statistics, opts);
    }
    
    /**
     *  Get the value of a set of statistics that was opened with a subscription.
     * 
     * @param {string} id The ID of the subscription.
     * @param {string[]} statisticIds A list of statistic IDs that belong to the specified subscription. If omitted, the Statistics API returns the current values of all statistics opened within the subscription. If specified, the Statistics API returns values for the statistics with the specified IDs.
     * @param {boolean} verbose
     * @returns {Promise}
     */
    peekSubscriptionStats(id, statisticIds = [], verbose = true) {
        const opts = {
            statisticIds: statisticIds,
            verbose: verbose? 'INFO': 'OFF'
        };
        return this.api.peekSubscriptionStats(id, opts);
    }
    
    /**
     *  Get the current value of a statistic from Stat Server.
     * 
     * @param {string} name The name of the pre-configured statistic to retrieve.
     * @param {string} objectId The ID of the object.
     * @param {string} objectType The type of object the statistic is for.
     * @returns {Promise}
     */
    getStatValue(name, objectId, objectType) {
        return this.api.getStatValue(name, objectId, objectType);
    }
    
    /**
     *  Get the current value of predefined statistics from Stat Server without a subscription.
     * 
     * @param {object[]} infos The set of statistics you want to get the values for from Stat Server.
     * @returns {Promise}
     */
    getStatValues(infos = []) {
        const statistics = {
            data: {
                statistics: infos
            }
        };
        
        return this.api.getStatValues(statistics);
    }
    
    destroy() {
        this.notifications.finalize();
    }
}


module.exports = Statistics;
