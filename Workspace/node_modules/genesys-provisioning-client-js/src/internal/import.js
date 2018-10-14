
const provisioning = require('./code-gen/provisioning-api');
const request = require('request');
const Promise = require('promise');

class ImportApi {
	
	constructor(client, log, apiKey, sessionId) {
		this._client = client;
		this._importApi = new provisioning.ImportApi(client);
		this._log = log;
		this._apiKey = apiKey;
		this._sessionId = sessionId;
	}
	
	/**
     * Import users.
     * Import users in the specified CSV/XLS file.
     * @param {String} fileName The file name of the CSV/XLS file to import.
     * @param {String} fileContents The contents of the CSV/XLS file to import. Can be either String or Buffer for streaming file upload.
     * @param {Boolean} validateBeforeImport Specifies whether the Provisioning API should validate the file before the actual import takes place. (default to false)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}.
     */
	importFile(fileName, fileContents, validateBeforeImport) {
		
		return new Promise((resolve, reject) => {
			const formData = {
				csvfile: {
					value:  fileContents,
					options: {
					  filename: fileName,
					  contentType: 'text/csv'
					}
				},
				validateBeforeImport: (""+validateBeforeImport)
			};
			this._log(`Importing File: [fileName: ${fileName}]`);
			request({
				uri: this._client.basePath + '/import-users/csv',
				method: 'POST',
				formData: formData,
				headers: {
					'x-api-key': this._apiKey,
					'Cookie': this._sessionId
				}
			}, (err, httpResponse, body) => {
				if(err) reject(err);
				else resolve(body);
			});
			
		});
	}
	
	/**
     * Get import status.
     * Get all active imports for the specified tenant.
     * @param {String} adminName The login name of an administrator for the tenant.
     * @param {String} tenantName The name of the tenant.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing the import status.
     */
	async getStatus(adminName, tenantName) {
		this._log(`Getting Import Status [adminName: ${adminName}]`);
		return (await this._importApi.getImportStatus(adminName, tenantName)).data;
	}
	
	/**
     * Stop import.
     * Terminates the current user import operation.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}.
     */
	async terminate() {
		this._log(`Terminating Import`);
		return await this._importApi.terminateImport();
	}
	
	/**
     * Validate the import file.
     * Performs pre-validation on the specified CSV/XLS file.
     * @param {String} fileName The file name of the CSV/XLS file to validate.
     * @param {String} fileContents The contents of the CSV/XLS file to validate. Can be either String or Buffer for streaming file upload.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}.
     */
	validateFile(fileName, fileContents) {
		
		return new Promise((resolve, reject) => {
			const formData = {
				csvfile: {
					value:  fileContents,
					options: {
					  filename: fileName,
					  contentType: 'text/csv'
					}
				},
				
			};
			this._log(`Validating File: [fileName: ${fileName}]`);
			request({
				uri: this._client.basePath + '/import-users/validate-csv',
				method: 'POST',
				formData: formData,
				headers: {
					'x-api-key': this._apiKey,
					'Cookie': this._sessionId
				}
			}, (err, httpResponse, body) => {
				if(err) reject(err);
				else resolve(body);
			});
			
		});
	}
	
	
}

module.exports = ImportApi;