/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import type {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeTypeBaseDescription,
} from 'n8n-workflow';

import { loadOptions, listSearch } from './methods';
import { router } from './actions/router';
import { versionDescription } from './actions/versionDescription';

export class MicrosoftTeamsV2 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			...versionDescription,
		};
	}

	methods = { loadOptions, listSearch };

	async execute(this: IExecuteFunctions) {
		return router.call(this);
	}
}
