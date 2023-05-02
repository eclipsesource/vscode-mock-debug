import * as vscode from 'vscode';

export class CharacterAnalysisProvider implements vscode.TreeDataProvider<string> {

    private _onDidChangeTreeData: vscode.EventEmitter<string | undefined> = new vscode.EventEmitter<string | undefined>();
    readonly onDidChangeTreeData: vscode.Event<string | undefined> = this._onDidChangeTreeData.event;

    private currentResult?: string = undefined;
    private smallNumberDecorationType: vscode.TextEditorDecorationType;
    private largeNumberDecorationType: vscode.TextEditorDecorationType;

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.debug.onDidChangeActiveDebugSession(e => {
                e?.customRequest('characters').then(result => this.refresh(result));
            })
        );
        context.subscriptions.push(
            vscode.debug.onDidReceiveDebugSessionCustomEvent(e => {
                if (e.session.type === 'mock' && e.event === 'characters') {
                    this.refresh(e.body);
                }
            })
        );

        this.smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
            borderWidth: '1px',
            borderStyle: 'solid',
            overviewRulerColor: 'blue',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            light: {
                // this color will be used in light color themes
                borderColor: 'blue'
            },
            dark: {
                borderColor: 'blue'
            }
        });

        this.largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
            borderWidth: '1px',
            borderStyle: 'solid',
            overviewRulerColor: 'blue',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            light: {
                borderColor: 'red'
            },
            dark: {
                borderColor: 'red'
            }
        });
    }

    private refresh(newResult?: string) {
        this.currentResult = newResult === undefined ? undefined : 'Line length: ' + newResult;
        this._onDidChangeTreeData.fire(undefined);
        this._onDidChangeTreeData.fire(this.currentResult);
        if (newResult) {
            const length = Number.parseInt(newResult);
            vscode.window.activeTextEditor?.setDecorations(this.largeNumberDecorationType, []);
            vscode.window.activeTextEditor?.setDecorations(this.smallNumberDecorationType, []);
            if (length > 50) {
                vscode.window.activeTextEditor?.setDecorations(this.largeNumberDecorationType, [{
                    range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10)),
                    hoverMessage: 'Line length is' + length
                }]);
            } else {
                vscode.window.activeTextEditor?.setDecorations(this.smallNumberDecorationType, [{
                    range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10)),
                    hoverMessage: 'Line length is' + length
                }]);
            }
        }
    }

    getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
        if (this.currentResult) {
            return new vscode.TreeItem(this.currentResult);
        }
        return new vscode.TreeItem('No item');
    }

    getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
        if (this.currentResult) { return [this.currentResult]; }
        return [];
    }
}