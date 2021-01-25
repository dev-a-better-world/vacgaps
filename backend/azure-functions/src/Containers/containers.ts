import { EnvironmentSettings } from '../Settings/EnvironmentSettings';
import { CosmosClient, CosmosClientOptions, Container } from '@azure/cosmos';
import * as https from 'https';

export type SingleComingFeedback = {
    userId: string;
    reportId: string;
};

let clientSettings: CosmosClientOptions = {
    endpoint: EnvironmentSettings.cosmosEndpoint,
    key: EnvironmentSettings.secrets.cosmosSecret,
};

if (!EnvironmentSettings.cosmosRejectUnauthorized) {
    console.log('Allowing self signed certificate');
    clientSettings.agent = new https.Agent({
        rejectUnauthorized: false
    });
}

const client = new CosmosClient(clientSettings);

const database = client.database(EnvironmentSettings.getVacciDatabase);

const comingFeedbackContainer = database.container('ComingFeedback');

export function getComingFeedbackContainer(): Container {
    return comingFeedbackContainer;
}