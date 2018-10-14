
const provisioning = require("./code-gen/provisioning-api");

class OptionsApi {
	
	constructor(client, log) {
		this._optionsApi = new provisioning.OptionsApi(client);
		this._log = log;
	}
	
	/**
     * Get options.
     * Get options for a specified application and merge them with the person and agent group annexes.
     * @param {Object} opts Optional parameters
     * @param {String} opts.personDbid The DBID of a person. Options are merged with the person&#39;s annex and the annexes of the person&#39;s agent groups. Mutual with agent_group_dbid. 
     * @param {String} opts.agentGroupDbid The DBID of an agent group. Options are merged with the agent group&#39;s annex. Mutual with person_dbid.
     * @param {String} opts.application The name of an application. This value is set to CloudCluster by default.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise} containing the options.
     */
	async get(opts) {
		this._log(`Getting Options`);
		return (await this._optionsApi.getOptions(opts)).data;
	}
	
	/**
     * Modify options.
     * Replace the existing application options with the specified new values.
     * @param {String} application The name of an application. This value is set to CloudCluster by default.
     * @param {Object} options The new options.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}.
     */
	async modify(application, options) {
		this._log(`Modifying Options`);
		return (await this._optionsApi.modifyOptions({data: {application: application, options: options}})).data;
	}
	
	/**
     * Update options.
     * Add, edit or delete option values for the specified application.
     * @param {String} application The name of an application. This value is set to CloudCluster by default.
     * @param {Object} newOptions The options to add in the application. 
     * @param {Object} changedOptions The option values to update in the application. 
     * @param {Object} deletedOptions options to delete in the application. 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}.
     */
	async update(application, newOptions, changedOptions,  deletedOptions) {
		this._log(`Updating Options`);
		return (await this._optionsApi.updateOptions({data: {application: application, newOptions: newOptions, changedOptions: changedOptions, deletedOptions: deletedOptions}})).data;
	}
	
}

module.exports = OptionsApi;