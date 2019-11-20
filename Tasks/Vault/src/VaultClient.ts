import { injectable } from 'inversify';
import { RestClient } from 'typed-rest-client/RestClient'
import { IRequestOptions } from 'typed-rest-client/Interfaces'

import { TaskOptions } from './TaskOptions'
import { VaultAuthenticationProvider } from './AuthenticationProviders/VaultAuthenticationProvider'
import { VaultAuthentication } from './AuthenticationProviders/VaultAuthentication';
import { KeyValueEngine } from './Engines/KeyValue/KeyValueEngine';

const url = require('url');

@injectable()
export class VaultClient {
    private restClient! : RestClient;
    private _keyValue! : KeyValueEngine;

    public get keyValue() : KeyValueEngine {
        if (this._keyValue) {
            return this._keyValue;
        }

        if (!this.restClient) {
            throw new Error("Valut Client not initialized");
        }

        this._keyValue = new KeyValueEngine(this.restClient);
        return this._keyValue;
    }

    constructor(private options : TaskOptions, private authenticationProvider : VaultAuthenticationProvider) {
       
    }

    /**
     * Authenticates and initializes the client
     */
    public async initialize() {
        let auth = await this.authenticationProvider.authenticate();
        
        let requestOptions: IRequestOptions = {
            headers: {'Authorization' : 'Bearer ' + auth.clientToken }
        };

        let apiUrl = url.resolve(this.options.baseUrl, "v1")

        this.restClient = new RestClient("azure-pipelines-vault-extension", apiUrl, [], requestOptions);
        return this.restClient;
    }
}

