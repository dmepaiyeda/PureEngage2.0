
const provisioning = require('./code-gen/provisioning-api');
const request = require('request');
const Promise = require('promise');

class ExportApi {
	
	constructor(client, log, apiKey, sessionId) {
		this._exportApi = new provisioning.ExportApi(client);
		this._log = log;
		this._apiKey = apiKey;
		this._sessionId = sessionId;
	}
	
	/**
     * Export users.
     * Export the specified users with the properties you list in the **fields** parameter.
     * @param {Object} exportFileData Export File Data containing the list of fields, the fileName, personDBIDs to be exported and filterParameters.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with the export ID.
     */
	async exportFile(exportFileData) {
		this._log(`Exporting File: '${exportFileData.name}'`);
		return (await this._exportApi.exportFile(exportFileData)).data.id;
	}
	
	/**
     * Get export status.
     * Check the status of the specified export and return the percentage complete.
     * @param {Number} id The ID of a previously started export.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with the export status.
     */
	async getStatus(id) {
		this._log(`Getting Export Status [ID: ${id}]`);
		return (await this._exportApi.getExportStatus(id)).data;
	}
	
	/**
	 * Get Download URL.
	 * Get the URL that can be used to download the export.
	 * @param {Number} id The ID if the export.
	 * @return {String} the download URL.
	 */
	getDownloadUrl(id) {
		return this._exportApi.apiClient.basePath + `/export-users/?id=${id}&download=true`;
	}
	
	/**
	 * Download Exported CSV File.
	 * Download the exported CSV file and return its contents as a String.
	 * @param {Number} id The ID if the export.
	 * @return {Promise} a {@link https://www.promisejs.org/|Promise}, containing the contents of the exported file.
	 */
	async downloadExport(id) {
		return new Promise((resolve, reject) => {
			this._log(`Downloading Csv File`);
			request({
				headers: {
					"x-api-key": this._apiKey,
					"Cookie": this._sessionId
				},
				uri: this.getDownloadUrl(id),
				method: 'GET'
			}, (err, res, body) => {
				if(err) {
					reject(err);
				} else {
					resolve(body);
				}
				
			});
		});
	}
	
}

module.exports = ExportApi;