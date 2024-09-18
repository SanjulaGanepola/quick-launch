import * as vscode from 'vscode';
import { ApplicationManager } from './applicationManager/applicationManager';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "quick-launch" is now active!');

	const installedApplications = await ApplicationManager.getInstalledApplications();
	console.log(installedApplications);
}

export function deactivate() { }