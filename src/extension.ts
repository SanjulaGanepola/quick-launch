import * as vscode from 'vscode';
import { window } from 'vscode';
import ApplicationsTreeDataProvider from './view/applicationsTreeDataProvider';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "quick-launch" is now active!');

	const applicationTreeDataProvider = new ApplicationsTreeDataProvider(context);
	const applicationsTreeView = window.createTreeView(ApplicationsTreeDataProvider.VIEW_ID, { treeDataProvider: applicationTreeDataProvider });
	context.subscriptions.push(
		applicationsTreeView
	);
}

export function deactivate() { }