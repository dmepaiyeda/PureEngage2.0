
const provisioning = require("./code-gen/provisioning-api");

class UsersApi {
	
	constructor(client, log) {
		this._usersApi = new provisioning.UsersApi(client);
		this._log = log;
	}
	
	/**
     * Create a user.
     * Create a user ([CfgPerson](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPerson)) with the specified attributes.
     * @param {Object} user The user object to be added.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data containing the id and the person object.
     */
	async addUser(user) {
		this._log(`Adding user: '${user.userName}'`);
		return (await this._usersApi.addUser(user)).data;
	}
	
	/**
     * Update a user.
     * Update a user ([CfgPerson](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPerson)) with the specified attributes.
     * @param {String} dbid The user&#39;s DBID.
     * @param {Object} user The new user attributes.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}.
     */
	async updateUser(dbid, user) {
		this._log(`Updating user: '${user.userName}' [dbid: ${dbid}]`);
		return await this._usersApi.updateUser(dbid, user);
	}
	
	/**
     * Remove a user.
     * Remove the specified user, along with their associated login, places, and DNs. This removes the [CfgPerson](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPerson) object and any associated [CfgAgentLogin](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgAgentLogin), [CfgPlace](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPlace), [CfgDN](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgDN) objects. 
     * @param {String} dbid The users&#39; DBID.
     * @param {Boolean} keepPlaces If &#x60;true&#x60; or absent, the user&#39;s places and DNs are not deleted. 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}.
     */
	async deleteUser(dbid, keepPlaces) {
		this._log(`Deleting user, dbid: ${dbid})`);
		return await this._usersApi.deleteUser(dbid, {keepPlaces: keepPlaces});
	}
	
	/**
     * Get the logged in user.
     * Get the [CfgPerson](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPerson) object for the currently logged in user.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with the current user.
     */
	async getCurrentUser() {
		this._log(`Getting current user`);
		return (await this._usersApi.getCurrentUser()).data.user;
	}
	
	/**
     * Get a user.
     * Get the specified [CfgPerson](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPerson) object.
     * @param {String} dbid The user&#39;s DBID.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with the retrieved user.
     */
	async getUser(dbid) {
		this._log(`Getting user, dbid: ${dbid})`);
		return (await this._usersApi.getUser(dbid)).data.user;
	}
	
	/**
     * Get users.
     * Get [CfgPerson](https://docs.genesys.com/Documentation/PSDK/latest/ConfigLayerRef/CfgPerson) objects based on the specified filters.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.limit Limit the number of users the Provisioning API should return.
     * @param {Number} opts.offset The number of matches the Provisioning API should skip in the returned users.
     * @param {module:model/String} opts.order The sort order.
     * @param {String} opts.sortBy A comma-separated list of fields to sort on. Possible values are firstName, lastName, and userName. 
     * @param {module:model/String} opts.filterName The name of a filter to use on the results.
     * @param {String} opts.filterParameters A part of the users first or last name, if you use the FirstNameOrLastNameMatches filter. 
     * @param {String} opts.roles Return only users who have the Workspace Web Edition roles. The roles can be specified in a comma-separated list. Possible values are ROLE_AGENT and ROLE_ADMIN,ROLE_SUPERVISOR. 
     * @param {String} opts.skills Return only users who have these skills. The skills can be specified in a comma-separated list. 
     * @param {Boolean} opts.userEnabled Return only enabled or disabled users.
     * @param {module:model/String} opts.userValid Return only valid or invalid users.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with a list of retrieved users.
     */
	async getUsers(opts) {
		this._log(`Getting users`);
		return (await this._usersApi.getUsers(opts)).data.users;
	}
	
}

module.exports = UsersApi;