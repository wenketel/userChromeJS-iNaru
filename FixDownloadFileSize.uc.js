// ==UserScript==
// @name      FixDownloadFileSize
// @version   0.01
// @note       http://tieba.baidu.com/p/3255073796
// @include    main
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (DownloadUtils.convertByteUnits = 
function DU_convertByteUnits(aBytes) {
	let unitIndex = 0;
	while ((aBytes >= 999.5) && (unitIndex < 3)) {
		aBytes /= 1024;
		unitIndex++;
	}
	return [(aBytes > 0) && (aBytes < 100) && (unitIndex != 0) ? (aBytes < 10 ? (parseInt(aBytes * 100) / 100).toFixed(2) : (parseInt(aBytes * 10) / 10).toFixed(1)): parseInt(aBytes), ['bytes', 'KB', 'MB', 'GB'][unitIndex]];
});
