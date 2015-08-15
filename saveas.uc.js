download_dialog_saveas: function(enable) {

if (!enable) return;

var saveas = document.documentElement.getButton("extra1");

saveas.setAttribute("hidden", "false");

saveas.setAttribute("label", "\u53E6\u5B58\u4E3A");

saveas.addEventListener('command', function(){
var mainwin = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
mainwin.eval("(" + mainwin.internalSave.toString().replace("var fpParams", "fileInfo.fileExt=null;fileInfo.fileName=aDefaultFileName;var fpParams") + ")")(dialog.mLauncher.source.asciiSpec, null, (document.querySelector("#locationtext") ? document.querySelector("#locationtext").value : dialog.mLauncher.suggestedFileName), null, null, null, null, null, null, mainwin.gBrowser.contentDocumentAsCPOW, 0, null);
close();
});

},
