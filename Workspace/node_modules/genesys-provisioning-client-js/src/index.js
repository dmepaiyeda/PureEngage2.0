const { adapt: adaptCometDClientForNode } = require('./cometd-nodejs-client');
const CometDLib = require('cometd');

const provisioning = require('./internal/code-gen/provisioning-api');

const UsersApi = require('./internal/users.js');
const ObjectsApi = require('./internal/objects.js');
const OptionsApi = require('./internal/options.js');
const ExportApi = require('./internal/export.js');
const ImportApi = require('./internal/import.js');
const OperationsApi = require('./internal/operations.js');

const Promise = require('promise');
const EventEmitter = require('events');

adaptCometDClientForNode();

class ProvisioningApi extends EventEmitter {
	
	/**
	 * Constructor
	 * Constructs a new ProvisioningApi Object
	 * @param {String} apiKey The API key used to access the provisioning api.
	 * @param {String} baseUrl The URL of the provisioning service.
	 * @param {Boolean} debugEnabled If set to true the ProvisioningApi will log it's activity with console.log.
	 */
	constructor(apiKey, baseUrl, debugEnabled) {
        super();
		this._apiKey = apiKey;
		this._provisioningUrl = `${baseUrl}/provisioning/v3`;
		
		
		this._client = new provisioning.ApiClient();
		this._client.basePath = this._provisioningUrl;
		this._client.enableCookies = true;
		this._cookieJar = this._client.agent.jar;
		
		if (apiKey) {
		  	this._client.defaultHeaders = { 'x-api-key': apiKey };
		}
		
		this._sessionApi = new provisioning.SessionApi(this._client);
		
		if(debugEnabled) {
			this._loggerFunction = (msg) => {
				console.log(msg);
			};
		} else {
			this._loggerFunction = (msg) => {}
		}
		
	}
	
	_log(msg) {
		this._loggerFunction(msg);
	}
	
	async _initializeCometd() {
		this._log('Initializing cometd...');
		this._cometd = new CometDLib.CometD();
		const transport = this._cometd.findTransport('long-polling');
		
		transport.context = { cookieJar: this._cookieJar };
		this._cometd.configure({
		  url: `${this._provisioningUrl}/notifications`,
		  requestHeaders: {
			'x-api-key': this._apiKey,
		  }
		});
		this._log('Starting cometd handshake...');
		
		await new Promise((resolve, reject) =>{
			this._cometd.handshake(reply =>{
			    reply.successful
					? resolve(reply)
					: reject(reply)
			})
        });
        
		this._log('Handshake successful');
		const onCometdMessage = this._onCometdMessage.bind(this);
		await new Promise((resolve, reject) => {
			this._cometd.subscribe(
			  '/*',
			  msg => { 
			  	
			  	onCometdMessage(msg) 
			  },
			  result => {
				const status = result.successful
				  ? 'successful'
				  : 'failed';
				this._log(`${'/*'} subscription ${status}.`);
				if(result.successful) resolve()
				else reject(result)
			  }
			);
		});
		
  	}
  	
  	_onCometdMessage(msg) {
  		msg = msg.data;
		if(msg.channel == 'operations') {
			this.operations._onAsyncResponse(msg.data.id, msg.data.data);
            this.emit('OnAsyncResponse', msg);
		}
		this._log(`CometD Message on channel: ${msg.channel} with data: ${JSON.stringify(msg.data)}`);
  	}
	/**
	 * Initialize Provisioning.
	 * Initialize provisioning with either an authorization token or and authorization code.
	 * @param opts Optional parameters.
	 * @param opts.token Token retrieved from authorization service when using resource owner grant.
	 * @param opts.code Code retrieved from authorization service when using code grant.
	 * @param opts.redirectUri The initial redirect URI used in oauth when using code grant.
	 */
	async initialize({token, code, redirectUri}) {
		
		let options = {};
		
		if (code) {
			options.code = authCode;
			options.redirectUri = redirectUri;
		} else if (token) {
		 	 options.authorization = 'Bearer ' + token;
		}
		
		this._log('Initializing provisioning...');
		let resp = await this._sessionApi.initializeProvisioningWithHttpInfo(options);
		
		this._sessionCookie = resp.response.header['set-cookie'].find(v => v.startsWith('PROVISIONING_SESSIONID'));
		this._cookieJar.setCookie(this._sessionCookie);
		this._log('Provisioning SESSIONID is: ' + this._sessionCookie);

		await this._initializeCometd();
		
		this._initialized = true;
		this._log("Initialization Complete");
		
		this.users = new UsersApi(this._client, this._log.bind(this));
		this.objects = new ObjectsApi(this._client, this._log.bind(this));
		this.options = new OptionsApi(this._client, this._log.bind(this));
		this.export = new ExportApi(this._client, this._log.bind(this), this.apiKey, this._sessionCookie);
		this.import = new ImportApi(this._client, this._log.bind(this), this.apiKey, this._sessionCookie);
		this.operations = new OperationsApi(this._client, this._log.bind(this));
	}
	
	/**
	 * Set Logger function.
	 * Customize the logging of messages by setting the logger function that the ProvisioningApi will use to log it's activity (eg. on API calls or CometD notifications).
	 * @param {Function} logger The custom logging function.
	 */
	setLogger(logger) {
		if(typeof logger == "function") this._loggerFunction = logger;
	}
	
	/**
	 * Logout and Disconnect CometD
	 * Logout of your Provisioning session and disconnect CometD. Only use after initializing.
	 */
	async destroy() {
		if(this._initialized) {
			this._log('Disconnecting CometD');
			await new Promise((resolve, reject) => this._cometd.disconnect((reply) => {
				if(reply.successful) resolve();
				else reject(reply);
			}));
			this._log('Logging Out');
			await this._sessionApi.logout();
		}
	}
	
}

module.exports = Object.assign({
	ProvisioningApi : ProvisioningApi
}, provisioning);
