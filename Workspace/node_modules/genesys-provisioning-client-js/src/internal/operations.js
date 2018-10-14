
const provisioning = require('./code-gen/provisioning-api');
const uuid = require('uuid');


class OperationsApi {
	
	constructor(client, log) {
		this._operationsApi = new provisioning.OperationsApi(client);
		this._log = log;
		this._asyncCallbacks = {};
	}
	
	_onAsyncResponse(id, response) {
		if(this._asyncCallbacks[id])
			this._asyncCallbacks[id](JSON.parse(response.data)["data"]);
	}
	/**
	 * Get users.
     * Get [CfgPerson](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPerson) objects based on the specified filters.
     * @param {asyncCallback} callback will return with data when async request is completed.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.limit Limit the number of users the Provisioning API should return.
     * @param {Number} opts.offset The number of matches the Provisioning API should skip in the returned users.
     * @param {String} opts.order The sort order.
     * @param {String} opts.sortBy A comma-separated list of fields to sort on. Possible values are firstName, lastName, and userName. 
     * @param {String} opts.filterName The name of a filter to use on the results.
     * @param {String} opts.filterParameters A part of the users first or last name, if you use the FirstNameOrLastNameMatches filter. 
     * @param {String} opts.roles Return only return users who have these Workspace Web Edition roles. The roles can be specified in a comma-separated list. Possible values are ROLE_AGENT and ROLE_ADMIN,ROLE_SUPERVISOR. 
     * @param {String} opts.skills Return only users who have these skills. The skills can be specified in a comma-separated list. 
     * @param {Boolean} opts.userEnabled Return only enabled or disabled users.
     * @param {String} opts.userValid Return only valid or invalid users.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}
     */
	async getUsers(opts, callback) {
		const aioId = uuid();
		this._asyncCallbacks[aioId] = callback;
		this._log(`Getting Users Async [aioId: ${aioId}]`);
		return await this._operationsApi.getUsersAsync(aioId, opts);
	}
	
	/**
     * Get used skills.
     * Get all [CfgSkill](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgSkill) that are linked to existing [CfgPerson](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPerson) objects. 
     * @param {asyncCallback} callback will return with data when async request is completed.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}
     */
	async getUsedSkills(callback) {
		const aioId = uuid();
		this._asyncCallbacks[aioId] = callback;
		this._log(`Getting used Skills Async [aioId: ${aioId}]`);
		return await this._operationsApi.getUsedSkillsAsync(aioId);
	}
	/**
	 * @callback asyncCallback
	 * @param {Object} data Response data.
	 */
	
}

module.exports = OperationsApi;