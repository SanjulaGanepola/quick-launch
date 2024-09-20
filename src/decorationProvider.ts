import { CancellationToken, Event, FileDecoration, FileDecorationProvider, ProviderResult, ThemeColor, Uri } from "vscode";
import ApplicationTreeItem from "./view/application";

export class DecorationProvider implements FileDecorationProvider {
    onDidChangeFileDecorations?: Event<Uri | Uri[] | undefined> | undefined;
    provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration> {
        if (uri.scheme === ApplicationTreeItem.contextValue) {
            const params = new URLSearchParams(uri.query);
            if (params.get('favorite') === 'true' && params.get('custom') === 'true') {
                return {
                    badge: '⭐⚙️',
                    color: new ThemeColor('QuickLaunch.favoriteApplication'),
                    tooltip: 'Favorite Application'
                };
            } else if (params.get('favorite') === 'true') {
                return {
                    badge: '⭐',
                    color: new ThemeColor('QuickLaunch.favoriteApplication'),
                    tooltip: 'Favorite Application'
                };
            } else if (params.get('custom') === 'true') {
                return {
                    badge: '⚙️',
                    color: new ThemeColor('QuickLaunch.customApplication'),
                    tooltip: 'Custom Application'
                };
            }
        }
    }
}