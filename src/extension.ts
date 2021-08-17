// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Parser } from './parser';
import writeGood from "write-good";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let activeEditor: vscode.TextEditor;
  let parser: Parser = new Parser();

  // Called to handle events below
  let updateDecorations = function (useHash = false) {
    // * if no active window is open, return
    if (!activeEditor) return;

    // * if lanugage isn't supported, return
    if (!parser.supportedLanguage) return;

    // Finds the single line comments using the language comment delimiter
    parser.FindSingleLineComments(activeEditor);

    // Finds the multi line comments using the language comment delimiter
    parser.FindBlockComments(activeEditor);

    // Finds the jsdoc comments
    parser.FindJSDocComments(activeEditor);

    // Apply the styles set in the package.json
    parser.ApplyDecorations(activeEditor);
  };

  // Get the active editor for the first time and initialise the regex
  if (vscode.window.activeTextEditor) {
    activeEditor = vscode.window.activeTextEditor;

    // Set the regex patterns for the specified language's comments
    parser.SetRegex(activeEditor.document.languageId);

    // Trigger first update of decorators
    triggerUpdateDecorations();
  }

  // * Handle active file changed
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        activeEditor = editor;

        // Set regex for updated language
        parser.SetRegex(editor.document.languageId);

        // Trigger update to set decorations for newly active file
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  // * Handle file contents changed
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      // Trigger updates if the text was changed in the same document
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  // * IMPORTANT:
  // Only run updateDecorations at most every second
  var timeout: NodeJS.Timer;
  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(updateDecorations, 1000);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
