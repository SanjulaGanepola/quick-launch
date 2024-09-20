import { CancellationToken, Event, FileDecoration, FileDecorationProvider, ProviderResult, ThemeColor, Uri } from "vscode";
import ApplicationTreeItem from "./view/application";

export class DecorationProvider implements FileDecorationProvider {
    onDidChangeFileDecorations?: Event<Uri | Uri[] | undefined> | undefined;
    provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration> {
        if (uri.scheme === ApplicationTreeItem.contextValue) {
            if (uri.path === 'favorite') {
                return {
                    color: new ThemeColor('QuickLaunch.favoriteApplication')
                };
            } else if (uri.path === 'custom') {
                return {
                    color: new ThemeColor('QuickLaunch.customApplication')
                };
            }
        }
    }
}