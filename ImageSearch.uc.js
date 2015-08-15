// ==UserScript==
// @name			ImageSearch
// @version			0.0.7
// @description		搜索相似图片
// @include			main
// @note			[20141005]通过压缩图片，改善bing大图出现空白页的问题。
// @note			[20141007]一些小改动。
// @note			[20150115]增加好搜。
// @note			[20150608]增加百度OCR，需要输入你百度apikey
// @note			[20150614]修正小错误
// @note			[20150716]增加kemuri-net.com
// ==/UserScript==

// 下面的字符串可以被用来与网站的特定的变量传递图像的信息

// {$URL}				-> 替换图像地址 - 对 GET 和 POST 有效
// {$IMGDATA}			-> 替换为被右击的图像的数据 - 对 POST 有效
// {$IMGBASE64[H]}		-> 替换为被右击的图像的Base64（末尾包含H表示完整base64编码）的数据 - 对 POST 有效

location == 'chrome://browser/content/browser.xul' && (function () {
	var imageSearch = {

		baiduApiKey: '', //在这里输入你的百度apikey, key获取地址http://apistore.baidu.com/apiworks/servicedetail/146.html

		bgImage: true, //是否对背景图起效

		get contextMenu() document.getElementById('contentAreaContextMenu'),

		zh: Cc['@mozilla.org/chrome/chrome-registry;1'].getService(Ci.nsIXULChromeRegistry).getSelectedLocale('browser').indexOf('zh') != -1,

		site: {
			//Google为一般模板，Bing和baidu相对特殊另外一些处理
			'Google': 		{
				disable: false,	//默认非禁用，可省略
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABEElEQVQ4jaXTv2vCQBTA8fx7So7iJnTyX3ByK/4BISkOEtDNQXAQoUPGIOgmFHQIuJSiiUuFTFI43rfDUa7WE5J2uOF+vM+99y7xVKgbKpRcRUKtEUquQt3w/hT8A/FcGw/PQpwK46WwO4IAL6/wNL896wTmGxgvLZYVsNrjzMIJlBcIEjsPEuFT1wSSrQ3ozYT3jxpAnJob+wuhPRSSLXSn7kY6ARUJ3amBhOtyKgPfDSwvsDvCY1wD6C/sS0zWBjmcoTOqAEzWwuYNWgO71hkJh/N1Y+8Cp9J+A78bm2YVgNX+Nt3WwGTVm1UooT009Z9KyApIM5O6K9gA//iZ/EgKzw9004+kqA2EkvuBbn4B7tf7hdjUNKEAAAAASUVORK5CYII=',		//true时默认会使用 配置目录\extensions\userchromejs@mozdev.org\content\skin\imageSearch\Google.png 同名png文件作为菜单图标，可使用base64图片，注意要用引号引住【如 icon: 'data:image/jpeg;base64,xxxxxxxxxx==',】
				left:{ //左键，下面如果出现both则为左右键行为一致
					url:'https://www.google.com/searchbyimage', //搜图地址
					method: 'GET', //GET方法
					parameters:{
						qs: ['image_url={$URL}'] //查询字符串，
					}
				},right:{//右键，下面如果出现both则为左右键行为一致
					url:'https://www.google.com/searchbyimage/upload', 
					method: 'POST',//POST方法
					parameters:{
						qs: ['encoded_image={$IMGDATA}']
					}
				}},
			'Bing': 	{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA30lEQVQ4jWP4v5PhPyWYAZnzfQszZQYEBAT8z010+r+6TZ18AwICAv6nxbpRZkBAQAB1DChLt/+/tFnz/92l/OQZMKXSEM5PjnH/P7NG7//FuaKkeSEy1AdFHN17BA34upn1f0eRGWkG5CY6/f+/k+H/3aX8/5tyLUlzQVqs2/+Lc0X/95UaY2hMjnH/f2SqNG4DchOd/veVGv8PCvRD0RgU6Pd/abMm1pSKYgA2W5tyLf8/WclDXDT+38nw/8hU6f+RoT7/02LdMJxLlAH/dzL8/7Od6f+f7Uykp0RyMAA2/oPVqQMzBQAAAABJRU5ErkJggg==',
				left:{url:'http://cn.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi', method: 'GET',
					parameters:{
						qs: ['imgurl={$URL}']
					}
				},right:{url:'http://cn.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi', method: 'POST',
					parameters:{
						qs: ['imgurl=', 'cbir=sbi', 'imageBin={$IMGBASE64}'],
						whst:'sbifsz={$W}+x+{$H}+%c2%b7+{$S}+kB+%c2%b7+{$T}&sbifnm=upload.{$T}&thw={$W}&thh={$H}',//链接参数，W、H、S、T分别对应 宽、高、图片大小、类型
						octetStream: true, //octet-stream
						compress: 160, //压缩图片最长/宽为160px
					}
				}},
			'Baidu': 		{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAz0lEQVQ4jaWSsQ3EIAxFMwY1Q1CyCBU7UbBPlAmiVBSmoaSMFKp/lVEgIpe7WHKHH88fJq0Ib3rSivBvDQHbesC7jG09AACRCiKV5wBrEqQIsCYhUqm6PeQC4APWJGhFsCZhmfcKWOZ9DIhUYE2CNQkAmhW8y/AuY5n3xqIBeJchRYBWVAfPdb6AIQ2AVVm7H/AuQyuCFKGucsmAVTk4KUIT5q1Br8rDPeQc5AWwrUdz8wgyBHCQd31r8ATgXR4DeH9+DQ6VP9LXFX6tCnjTH5mdFegLQizyAAAAAElFTkSuQmCC',
				left:{url:'http://stu.baidu.com/i', method: 'GET',
					parameters:{
						qs: ['rt=0', 'rn=10', 'ct=1', 'tn=baiduimage', 'objurl={$URL}']
					}
				},right:{url:'http://image.baidu.com/i?rainbow=1&rt=0&rn=10&ct=0&stt=0&tn=shituresultpc', method: 'POST',
					parameters:{
						qs: ['dragimage={$IMGBASE64H}'] //完整base64图片字符串
					}
				}},
			'BaiduOCR': 		{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA8ElEQVQ4jc3TPwsBcRgHcG/FcGWwmr0Cr8BmsupKJpNsLFcWMlNKFsMtV46ujgz+hfy7FC66UzjXLz9fg7K43GFgeLanT8/zfHtc7kgN35Trv4GCtMZwdfwM8ETrOJwvMAlFINV+Hwjn+5hvDZTkDTheeR8ot1TkhCXC+f7LNSwBhhVxOF8QzHTgjTVgEgp/QnYOhLI96CcChhXhjtQgDDQkK1PnQEnegO/uHsfkeAXN2d4ZwLAi9BOBdrxPwPEKTEJB6RW+uGQPBDMdTFTjqXGiGogVx/ZAQVpbxpauLiAMNHugPtItL+5PyJZx/v6ZbmkKfzRvTd7IAAAAAElFTkSuQmCC',
				both:{url:'http://apis.baidu.com/apistore/idlocr/ocr', method: 'POST',
					parameters:{
						qs: ['fromdevice=pc', 'clientip=10.10.10.0', 'detecttype=LocateRecognize', 'languagetype=CHN_ENG', 'imagetype=1', 'image={$IMGBASE64}'],
						name: 'BaiduOCR'
					}
				}},
			'HaoSou': 		{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACOElEQVQ4jY2QXUjTURjGn6FNV2GapTXdmDlZ00RJIrBYUjjoGwIL0mFFH0arjSjvxIFdVDcGLVOxyf5zuxjlsplp4oaKkSKkWwWhG2WkKfmxzabb0reLQTWabM/dOef9/V7OA4RJh+pwglFefuJmzOuS++g6o4cpHwAr3GxIqBaJPzVxdSvtrGUaAHkH188059W6tXhB3TB++QDtlTVFpICIajBBahDpMERm3KBeSEfuFMua0FbzCsZvNujoBxpNBBU7FD6KJLoAJynhJxUuU5gtDJgNw9Bpv6OJiN3YEiqQ4AGdBFEZLkb4JWsCT0yreESU/7I4CANxlItF/4HYdxFLAjAODc+HugCJWtuCAg4KiQu6p1AYohEAgAf1vR8LHi4AAKaTtpRWKat96PeURCuYR4Om8lLZZ6hy2Lhbcftq/KibMLB4LlpBvfRazzZttj94miAuxgKEQS8TFW1EjPhZ5mSafufo30tHoA/DS350uoSR+L3dvPM5bZnE04uq/hXsx8jyKixuO4xTW9eCpW9SCvf18Dy7zDsmBc2CxNBXm68SfR6CafbrOmZMVmRV/hmQjW5MOW3fXH3k7fYliSX9V545Q803CrP/X9HvksE8twBmmjiPP/nlzlzHrSmOs8KZsFL6PpmODaXaJdZ09e6ODBI+FXpTGdHBMCXNbYJuRh7f4OjiqvtmD7VfHy+3ZRnO2pNPFVkRW2RNyy/oFPhFrVmU1iKej9RZ2Ozp4h8XPxe6+AaR5Td0kvFGXgTX5gAAAABJRU5ErkJggg==',
				left:{url:'http://st.haosou.com/stu', method: 'POST',
					parameters:{
						qs: ['base64image=', 'submittype=imgurl', 'imgurl={$URL}', 'src=st']
					}
				},right:{url:'http://st.haosou.com/stu', method: 'POST',
					parameters:{
						qs: ['imgurl=', 'base64image={$IMGBASE64H}', 'submittype=drag', 'src=st'] //完整base64图片字符串
					},
					octetStream: true, //octet-stream
				}},
			'SauceNAO': 	{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVElEQVQ4ja2SwQ4AMARD+/8/bbdlw8ogcdK9RQsApNmQal2A359dgCK7j07tBmiBByGzWMjABsBMfaaQgdAYxwGtFVomMiGZDRxSYFLulCtFY8z2AmZhBhe3B+XrAAAAAElFTkSuQmCC',
				left:{url:'http://saucenao.com/search.php', method: 'GET',
					parameters:{
						qs: ['db=999', 'url={$URL}']
					}
				},right:{url:'http://saucenao.com/search.php', method: 'POST',
					parameters:{
						qs: ['db=999', 'file={$IMGDATA}']
					}
				}},
			'IQDB': 		{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABdUlEQVQ4jX2SMYqEQBBF+xpmHkAwNDYVQYxNpPOJlGFSI1PDTgQxEzpa8AwG6hnEOYAewOBvMPxenZ3doNBuql79+l2ibyp0hUR5Sz9GnsTIkxijvuP59cDaRsiTGOUtxTZoiL6p/ixidIXE2kYmZOhDhj66QkL81/V8N6noAlnb6KXgnDTqOyYVXQB5EpuOVMN8o+A8I5OYSJhjWwg8F4HnGvl7X/8o2AZtCvqmwjZo0J/Ac01XQngnyluKWWWmOxP7psKxjJChD8e2zJkQx7aQJzFEnsRY2whdIc2cgeeiKySOZcQ2aHSFxKRephHKMIDylhoAVRzLaILFxzKCuzOrDEKGvnH+7DQlH8uIva+x9zVmlWHva2yDxvPr8TKRRTL0jcM8E7IN+heAITgzi/nv2BYc28Ko75cxqIZ34r37GSBDH7PKLh0p/aLgfQwC+BqzyjCr7LJkVCHoPnf9fVkCzzXwM9SMwCeZVHT5fgJx+85P+g1/aX2+28hpggAAAABJRU5ErkJggg==',
				left:{url:'http://iqdb.org', method: 'GET',
					parameters:{
						qs: ['url={$URL}']
					}
				},right:{url:'http://iqdb.org', method: 'POST',
					parameters:{
						qs: ['file={$IMGDATA}']
					}
				}},
			'TinEye': 		{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABIklEQVQ4jbXRv2qDQADHcZ8oEMx1CFRLRMmzOGUxjQYptMXBol1bcHUoaGgFaZpQlOuUoVMp0hcwjsVBcPp1aU3zTzC0B9/huLsPxx0j2pSXLLqQ7Bc0yqIL0aY8I1l02fjwClkyBx/+7u+BOMmwb8RJBsGMIFq0HvhIP8HpPvKiRF6UOB7fIS9KxEmGk/MAghntB66fEtzO39eA7qmLm9kbru5fwel+PSCYEXrGFD1jugZ09YdVZ49VjGhRCGYEwYzAG8/gLubV4g/Qkh2wigeiBiBqgKNxWMX8nmy2Ceza8z+AcDnb+kJO97euX3sDogZoD1y0ZAct2UF74DYHOsMJWMUDq3joDCe7AaKFad071EW0MGXIKOwfghAtTMko7H8B/cKdSrjV4ooAAAAASUVORK5CYII=',
				left:{url:'http://www.tineye.com/search/', method: 'GET',
					parameters:{
						qs: ['url={$URL}']
					}
				},right:{url:'http://www.tineye.com/search/', method: 'POST',
					parameters:{
						qs: ['image={$IMGDATA}']
					}
				}},
			'GazoPa': 		{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABKklEQVQ4jZWToY6DQBCGsW2ym2BWYk9Ogq4hPEBRBHRNwzOAwVSdI8EVxzPwCAiSij4IyYlmTfOfIDNZeidA/Nndyc6Xf2ZnPaMVjFaIshJ5PYAoBMe2yDNaoehnVONbtAfiRVmJanwjykoQhSj6GUYrEIX/Kj0neFmL6fFcAEU/I68HKYNBfIkohD34ope1oq5t1oC8HsRN1zaYHk+8rIXRCrejEoDRSpx4eT2Ibe4HJ/LKyexsBUjPCarxjaKfEWUlin4We3zJHnzcjouLPyW41hnEiSy3B13bSJwoXABu1+OrxuUe4HIPEF/1tjlwdbkH+P75WomfbxfA3bvlbAbQyZd9ek6kL59ONpXgOtgMiK8adPIxPZ4ykbsAfOZh2u3AjXVtI/r8qb8mRhP0ovsW2gAAAABJRU5ErkJggg==',
				left:{url:'http://www.gazopa.com/search/navigate', method: 'GET',
					parameters:{
						qs: ['key_url={$URL}']
					}
				},right:{url:'http://www.gazopa.com/search/navigate', method: 'POST',
					parameters:{
						qs: ['file={$IMGDATA}']
					}
				}},
			'Ascii2D': 		{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4jWP4TyFgoKoBDAwM/xkYcJuJTZ4BXRKXIbjkqWcAxV4gFww3A0bTAXmAYgMAqSRsvtoqneQAAAAASUVORK5CYII=',
				left:{url:'http://www.ascii2d.net/imagesearch/search/', method: 'POST',
					parameters:{
						qs: ['uri={$URL}']
					}
				},right:{url:'http://www.ascii2d.net/imagesearch/search/', method: 'POST',
					parameters:{
						qs: ['upload[file]={$IMGDATA}']
					}
				}},
			'Cydral': 		{//本人无法打开这个网站
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAtklEQVQ4jcWTsQ3EIAxF2SRdZvIemYAp3GQJhvAIFJbSsQWK9FPZMuiik3KKrvgCBH62P5C2/UBa8UjbfiDZ5InSipcARBnLQoOI8neABTIXMJcBRJRdHwF2SLWh9xO9n1BtEKkOi+ABEIMjgLn4ngWqNq8srUCyhUiFagNz8dEA1hZRhkiFSHXwABCpnm028RYwtxDLjQbetmAmziYxF89mFd2aGK/RNLcQr/K9h/Sfv/Drd74AXECGABTGMjUAAAAASUVORK5CYII=',
				both:{url:'http://www.cydral.com/', method: 'GET',
					parameters:{
						qs: ['url={$URL}']
					}
				}},
			'Yandex': 		{//网站使用json查询，如果要使用本地的图片只能在网站上上传了。
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABjklEQVQ4jY2TTWsTURSGnz+gol0MuJyNSEELRZOKiGjNB0jrUt268GsjbqSL7KS7wPwqpWjJtplpiGUKYWDIxiQzc2fuvC40IQmVzoFn+T73HngPwAZwF9iuyBXWZms8HvdUYaIo+gbcWhfck0pVxfO8N+u/qJVlqdh1KhFF0RFwe1lQL61V7DqXrhC7jkpr5XneW+DqXPDA2qKywNpCUTT6CWzOBQ+LIl8Ifn/f1ORH/b+CoshVFLm63e5H4BrAozw3C8HkaFvTXmMRstauCPLcKM+Nzs/DHnAH4LEx2YUrBL6v169eKgiChcCYTMZkCsOwB2wBPDFZqth1NBqN9OH9Ow0Gpwp8X+1WUzu1mtqtpvr9/l9BlspkqQ4Pv34CrgPsZmmi2HX0Yn9PO7WaWs3GIjyn8WxXsesoSxOd/Rr2/rUSgEaazBS7zkrgImLXUZrM1Ol0PgM35oJWkkwrF2k4OD0G7i8XqZ3MJqrKwcGXldcBnoZnw5PZdKLLCHz/GKivH9NNoAE8r8jGcvgPaCFD9Yl2AZgAAAAASUVORK5CYII=', 
				both:{url:'https://yandex.com/images/search', method: 'GET',
					parameters:{
						qs: ['rpt=imageview', 'img_url={$URL}']
					}
				}},
			'Regex': 		{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABbElEQVQ4jX2TMY6DMBREuUKUKodA1EjULl1ATwcWXX7FBZCPYLSiZjvikpYSFFFEOQFdbjFbRHZsgrYYCbDm+c/oE7yeD8zj8K+2SWOb9OFZMI8DbpLQ1QI3SSiSGJfTGZfTGSwKwaIQRRKjqwUW1eAmyVMwjwO6WqCrBVgUWvNeLAohq9wazYV2AlnlXwZX5tvhBC6gSGK0aYY2zaBLgTtdvencKItq/A5MXgMwMucGsPYKi2qw9uoD2BdInKFNM7AoRJtmWFQD4gx3un4DZJVDVjmIM6/5O13RpplnklUOFoXoaoFt0gh+f5RXVpHEVroUNsaiGiyqsV3IKj8G7GG6FCDObHkmpgeQVY6uFjDPLsBMQJzZ3F6EeRzsgVFXCxRJbCEsCkGc4SbJ9kScvUvcJm0LMqDX84G1V95SGaP73qbZG2Da3a+qazAwt2Ti7BPBXRxdCm8njn4uC1h7ZW/VpbAizjyj6WIP+APRTkH9vCOomwAAAABJRU5ErkJggg==',
				left:{url:'http://regex.info/exif.cgi', method: 'GET',
					parameters:{
						qs: ['url={$URL}']
					}
				},right:{url:'http://regex.info/exif.cgi', method: 'POST',
					parameters:{
						qs: ['dummy=no', 'f={$IMGDATA}']
					}
				}},
			'E-Hentai': 	{//本人无法打开这个网站
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAOklEQVQ4jWN4dPvkf0owA1UMSGMTxMDIitDFkPnUNQCXM4eQAcgS2NjY1FHXgIEPA6oFIv1T4oDmRgBHn8G//HQP5wAAAABJRU5ErkJggg==',
				both:{url:'http://gu.e-hentai.org/image_lookup.php', method: 'POST',
					parameters:{
						qs: ['sfile={$IMGDATA}', 'f_sfile=File Search', 'fs_similar=on', 'fs_exp=on']
					}
				}},
			'Doujinshi': 	{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADi0lEQVQ4jQXBfUyUdQDA8adY1lL/sJpKLxs5av0ZDijBNbOl2EKJDA0yNjpOOC/ejXhbGo2XO15sIyJePODoRTpLai5AAnkpwZjASoa8v8odHAcccNzL83u+fT5SxdNPEenlRUeqCuXu73i+zUcYSxANVxAtDThrdYjKQuS0JDzZaTg1sWxnp+K8cglnvArplCTx/q6dbOZlItcUsa1RI+d+jmj/CWW4E5s+C09BFishx9j44DSbnyWyoM/EWvEVtiQ1Urb3Pn72fQlXfjbO9EQsfv640j5F+a+drbZrmPPS2U7VYgs5zvLrh1iLi2HucgrTKbFY07VITq2KsYBAFi4l47qo5aF/IBZ1NJaaAmZ1GUzpM3AkxLF1JoKloGDsiWrMRVlYchIxp19AGlVFcnX/fsYvJ+NOucD8W2+ypPkEZgbh7xtg0CG+K2Bdo8LqH8BiYRby/R6YH4C/fkEy+viQs3MXDzUq5PhYhsNCWW2oojL3C7TBB6mJOIGj1Yjlagnm8JMsXNRgilcTEXCQwnNhSPrdu4n28qLzdCjuqEjGz4bTnRDNc088g/Tky3g/ewBL7x+ImXtYW35gpUrHWHczr+zzRnr8eaRv9uxB88ijlAcFsvpeGOMn3qZTdZbfTI0cOPwxPv7hWG02lNkh5NEeGOliwzzLl4VlPPbCUaSyvXvJ2rGD2yHHcZ6Lot/Xl/XWG4yu2TnzkZrQd6JwOxzIiw/wjHQhpvpYW5oj/MM4Al99A2k57CRth15jzVSLkqRlws+PybKvcT3oY6KxCvv0MIp1EnngFsJUgdzzK8rsANau65ibKpFmg4NZTNYiBm/jUccwERDIRG4mSm0BDDaDdQqxaUPcvYmozEMYdMimcrheCXk5SP2+L7LU1YJyvw9Fe57p4MNMZmgRSyO4J+8hb60jZBlhmUCYyhF1RYi6ImSDDk9FPtJQTCRu+zqOsSFsmlimAwIZP3YUT287AAJwrSyxWl2Ky1iKqC9GNpYg6osR35ci2eqqELIH97YdV3cLY0eOYD71Lv8G+TNfVoqwr4B7C/lOE6IqH9FQilxfjGIswW3QI630tCELBeHaYnlhht6E89xK0tDR3MKdGgOjPX+yvjiFPPEPoqkaUVuEbCzBVavHXpmHtNx+E1korE0PU54cS54qgh8bTcw5BA7AvOmitbefkd4OPG3XcFbns23QsVFdgMug53+81umV4qaRyQAAAABJRU5ErkJggg==',
				left:{url:'http://www.doujinshi.org/IMGSERV/socket.php', method: 'GET', 
					parameters:{
						qs: ['URL={$URL}', 'COLOR=4']
					}
				},right:{url:'http://www.doujinshi.org/IMGSERV/socket.php', method: 'POST',
					parameters:{
						qs: ['img={$IMGDATA}', 'COLOR=4']
					}
				}},
			'Kemuri': 	{
				icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACAUlEQVQ4jY2TazMbYRiG9//PrENbVadSxqF1aMtgqKJ2c5CDTUQiIhLVEHx4j7ufr37YkGYw9QPu637neu7Xqd9H1O8jzm4jyu2QoBVy+DvkoGHYqRnWK5rlkmYu0EzlJKOHkncpyYAvcT2BU7+POL+LqLQjjq9DclchiaZl79yyWTV8K2s+FxUzecVYVjKclgwm4vAjoHobcXITcdSypC8tvy4s22eGtYph6VgxGyg+ZiUjacnbpKDfF11A7S6i0g4pXodkr0L8hmX33LBR1ayUNAsFzVReMpZRDKUkg3633fUETvU2onQTkv8Tkmpa9uuGraphtaz5UlTMHCkmsorhtOBNUtD/T9j1BE65HVJohWQuLQcNy07Nsl4xrJQUc4HqiktKBvzesOsJnAdxyaZlt27YPNWP4qbzivGsYjjVK64HELQs6cuQgwvLds2wVtEsHetYXE4xcvhUXA8ge2XxG5afNcNG1fD1RLNQUEzl46cPpSQDiefDridwUk3L/oVl60zz/UFcoJjo3PxNQtD3Qtj1BE4szrB+Gi9uvqCYzKmOOPGsuB7AXt30LG46rxjPSN6nJYP/aXc9gfOjI26xpJk9UkxmFR+eWdyLgI3TrrhPecloJhb30tmeAFbLhsWi7izuQZyk7xXtridwlkua+SAWN5KJv2q//7p21xP8BWUjX/7H+1O1AAAAAElFTkSuQmCC',
				left:{url:'http://details.kemuri-net.com/similar_search.php', method: 'POST', 
					parameters:{
						qs: ['url={$URL}', 'mode=url']
					}
				},right:{url:'http://details.kemuri-net.com/similar_search.php', method: 'POST',
					parameters:{
						qs: ['MAX_FILE_SIZE=1024000', 'mode=file', 'up={$IMGDATA}']
					}
				}},
		},

		init: function(){
			if(document.getElementById('imageSearch')) return;
			this.createMenu();
			var cM = this.contextMenu;
			cM.addEventListener('click', this, false);
			cM.addEventListener('popupshowing', this, false);
		},

		createMenu: function(){
			var cE = this.createElement,
				site = this.site,
				menu = cE('menu', {id: 'imageSearch', hidden: true, 
					label: this.zh ? '搜索相似图片' : 'Image Search'}, 
					[this.contextMenu, document.getElementById('context-saveimage')]),
				popup = cE('menupopup', null, menu);
			for(var i in site){
				if(site[i].disable) continue;
				let icon = site[i].icon,
					tip = [];
				('left' in site[i]) && tip.push((this.zh ? '左键：' : 'Left Click:') + site[i].left.method);
				('right' in site[i]) && tip.push((this.zh ?'右键：' : 'Right Click:') + site[i].right.method);
				('both' in site[i]) && tip.push((this.zh ?'左、右键：' : 'Left & Right Click:') + site[i].both.method);
				cE('menuitem', {
					class: 'menuitem-iconic image-search-engine', label: i, tooltiptext: tip.join('\n'),
					src: (typeof icon == 'boolean') && icon ? 'chrome://userchromejs/content/skin/imageSearch/' + i.trim() +'.png' : (icon ? icon : '')
				}, popup);
			}
			this.menu = menu;
		},

		createElement: function(name, attr, parent){
			var e = document.createElementNS(
					'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', name);
			if(attr) for (var i in attr) e.setAttribute(i, attr[i]);
			if(parent){
				if(parent instanceof Array){
					parent[0].insertBefore(e, parent[1]);
				}else{
					parent.appendChild(e);
				}
			}
			return e;
		},

		handleEvent: function(event){
			switch (event.type){
				case 'click':
					this.onClick(event);
					break;
				case 'popupshowing':
					this.onPopupShowing(event);
					break;
			}
		},

		onClick: function(event){
			var target = event.target,
				click = event.button == 2 ? 'right' : (event.button == 0 ? 'left' : null),
				imgURL = (gContextMenu && (gContextMenu.onImage && gContextMenu.imageURL) || 
					(this.bgImage && gContextMenu.hasBGImage && gContextMenu.bgImageURL)),
				site = this.site, name = null, rule = null;
			if(!click || !target.classList.contains('image-search-engine') || !this.menu.contains(target)) return;
			name = target.getAttribute('label');
			if(name in site){
				let engine = site[name],
					imgDataRequest = '', 
					dataParam = {},
					imgIndex = 0;
				dataParam.qs = [];
				rule = engine[click] ? engine[click] : engine.both;
				for(var j in rule.parameters){
					if(j != 'qs') dataParam[j] = rule.parameters[j];
				}

				let regx = /\{\$([A-Z]*(?:64(?:H)?)?)\}/;
				for(var i = 0; i<rule.parameters.qs.length; i++){
					let match = rule.parameters.qs[i].match(regx);
					if(match){
						imgDataRequest = match;
						if(match[1] == 'URL'){
							dataParam.qs.push(rule.parameters.qs[i]
								.replace(regx, rule.method == 'GET' ? encodeURIComponent(imgURL) : imgURL));
						}else{
							imgIndex = i;
							dataParam.qs.push(rule.parameters.qs[i]);
						}
					}else{
						dataParam.qs.push(rule.parameters.qs[i]);
					}
				}

				if(!imgDataRequest) return;

				if(rule.method == 'GET'){
					this.methodGetURL(rule.url, dataParam);
				}else if(rule.method == 'POST'){
					if(imgDataRequest[1] == 'URL'){
						this.methodPostURL(rule.url, dataParam);
					}else{
						this.methodPostData(imgURL, rule.url, dataParam, imgIndex);
					}
				}
			}
		},

		onPopupShowing: function(event){
			var target = event.target;
			if(target.id == 'contentAreaContextMenu' && this.menu){
				if(gContextMenu && (gContextMenu.onImage || (this.bgImage && gContextMenu.hasBGImage))){
					this.menu.removeAttribute('hidden');
				}else{
					this.menu.setAttribute('hidden', true);
				}
			}
		},

		imageCompress: function(n, t){
			var y, u = (n, t, i, r, u, f, e) => {
				n[t] += i * e, n[t + 1] += r * e, n[t + 2] += u * e, n[t + 3] += f * e
			};
			if (!(t < 1) || !(t > 0)) return n.toDataURL();
			var yt = t * t, rt = n.width, it = n.height, l = Math.ceil(rt * t), ht = Math.ceil(it * t),
				nt = 0, ot = 0, f = 0, k = 0, d = 0, lt = 0, i = 0, b = 0, g = 0, a = 0,
				s = 0, st = 0, ft = 0, ut = 0, et = 0, v = !1, w = !1, p;
			try {
				p = n.getContext('2d').getImageData(0, 0, rt, it).data
			} catch (pt) {
				return !1
			}
			var r = new Float32Array(4 * rt * it),
				h = 0, o = 0, c = 0, e = 0;
			for (ot = 0; ot < it; ot++) for (d = ot * t, g = 0 | d, lt = 4 * g * l, w = g != (0 | d + t), w && (ut = g + 1 - d, et = d + t - g - 1), nt = 0; nt < rt; nt++, f += 4) k = nt * t,
			b = 0 | k, i = lt + b * 4, v = b != (0 | k + t), v && (st = b + 1 - k, ft = k + t - b - 1),
			h = p[f], o = p[f + 1], c = p[f + 2], e = p[f + 3],
			v || w ? v && !w ? (a = st * t, u(r, i, h, o, c, e, a), s = ft * t, u(r, i + 4, h, o, c, e, s)) : w && !v ? (a = ut * t, u(r, i, h, o, c, e, a), s = et * t, u(r, i + 4 * l, h, o, c, e, s)) : (a = st * ut, u(r, i, h, o, c, e, a), s = ft * ut, u(r, i + 4, h, o, c, e, s), s = st * et, u(r, i + 4 * l, h, o, c, e, s), s = ft * et, u(r, i + 4 * l + 4, h, o, c, e, s)) : u(r, i, h, o, c, e, yt);
			y = content.document.createElement('canvas'), y.width = l, y.height = ht;
			var vt = y.getContext('2d'), at = vt.getImageData(0, 0, l, ht), tt = at.data, ct = 0;
			for (f = 0, i = 0; ct < l * ht; f += 4, i += 4, ct++) tt[i] = Math.ceil(r[f]),
			tt[i + 1] = Math.ceil(r[f + 1]),
			tt[i + 2] = Math.ceil(r[f + 2]),
			tt[i + 3] = Math.ceil(r[f + 3]);
			return vt.putImageData(at, 0, 0), y.toDataURL();
		},

		getImageType: function(ascii){
			var hex = Array.prototype.map.call(ascii.slice(0, 2), function(s){
				return s.charCodeAt(0).toString(16);
			}).join('');
			return ['jpeg', 'png', 'gif', 'bmp'][['ffd8', '8950', '4749', '424d'].indexOf(hex)] || 'png';
		},

		methodGetURL: function(siteURL, siteVars){
			siteVars = siteVars.qs;
			siteVars = siteVars.join('&');
			siteURL += (siteURL.indexOf('?') > 0 ? '&' : '?') + siteVars
			gBrowser.loadOneTab(siteURL, null, null, null, false, false);
		},

		methodPostURL: function(siteURL, siteVars) {
			siteVars = siteVars.qs;
			var separator = '-----------------------------8361219948688';
			var formData = '';
			for (var i = 0; i < (siteVars.length); i++) {
				var splitVar = siteVars[i].split('=', 2);
				formData += '--' + separator + '\r\n' + 'Content-Disposition: form-data; name="' + splitVar[0] + '"\r\n\r\n' + splitVar[1] + '\r\n';
			}
			formData += '--' + separator + '--\r\n'; //finish off request
			var postData = Cc['@mozilla.org/io/string-input-stream;1'].createInstance(Ci.nsIStringInputStream);
			formData = 'Content-Type: multipart/form-data; boundary=' + separator + '\n' + 'Content-Length: ' + formData.length + '\n\n' + formData;
			postData.setData(formData, formData.length);
			var flags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
			gBrowser.selectedTab = gBrowser.addTab()
			gBrowser.loadURIWithFlags(siteURL, flags, Services.io.newURI(siteURL, null, null), null, postData);
		},

		methodPostData: function(imgURL, siteURL, siteVars, imgDataVar) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', imgURL, true);
			xhr.responseType = 'blob';
			xhr.onload = () => {
				var blob = xhr.response;
				if(!blob) return;
				var reader = new FileReader();
				reader.onloadend = () => {
					var result = reader.result;
					if(!result) return;
					var p = siteVars;
					siteVars = siteVars.qs;
					var match = siteVars[imgDataVar].match(/\{\$([A-Z]*(?:64(H)?)?)\}/);
					var base64 = match && match[1] && match[1].indexOf('IMGBASE64') == 0;

					//use post instead of get - tricky stuff here...
					var separator = '-----------------------------8361219948688';
					var cdfdname = '\r\nContent-Disposition: form-data; name="';
					var dataURL = '';
					var imageObj = null;
					var cpng = false;
					if(p.compress){
						cpng = true;
						imageObj = new Image();
						imageObj.src = imgURL;
						let e = p.compress / Math.max(imageObj.width, imageObj.height),
							t = content.document.createElement('canvas');
						(e <= 0 || e > 1) && (e = 1);
						t.width = imageObj.width, t.height = imageObj.height;
						t.getContext('2d').drawImage(imageObj, 0, 0, t.width, t.height);
						dataURL = this.imageCompress(t, e) || result;
					}else{
						dataURL = result;
					}
					var size = blob.size;
					dataURL = dataURL.split(',', 2)[1];
					var imageData = atob(dataURL);
					var mimetype = this.getImageType(imageData);
					dataURL = (base64 && match[2] == 'H' ? ('data:image/'+ (cpng ? 'png' : mimetype) +';base64,' + dataURL) : dataURL);
					var fileSpecifier = '';
					var formData = '';

					for (var i = 0; i < (siteVars.length); i++) {
						var splitVar = siteVars[i].split('=', 2);
						if (i == imgDataVar) {
							if(!base64){
								fileSpecifier = splitVar[0];
								formData += '--' + separator+ cdfdname + 'iso2"\r\n\r\nyoro~n\r\n';
							}else{
								formData += '--' + separator + cdfdname + splitVar[0] + '"\r\n\r\n' + dataURL + '\r\n';
							}
						} else {
							formData += '--' + separator + cdfdname + splitVar[0] + '"\r\n\r\n' + splitVar[1] + '\r\n';
						}
					}

					formData += '--' + separator + '--\r\n'; //finish off the string
					if(!base64){
						var suffixStringInputStream = Cc['@mozilla.org/io/string-input-stream;1'].createInstance(Ci.nsIStringInputStream);
						suffixStringInputStream.setData(formData, formData.length);
						//set up post form
						var prefixStringInputStream = Cc['@mozilla.org/io/string-input-stream;1'].createInstance(Ci.nsIStringInputStream);

						formData = '--' + separator + cdfdname + fileSpecifier + '"; filename="upload.'+ (cpng ? 'png' :mimetype.replace('jpeg', 'jpg')) + '"\r\n' + 'Content-Type: "image/'+ mimetype +'"\r\n\r\n';
						prefixStringInputStream.setData(formData, formData.length);
						//create storage stream
						var binaryOutStream = Cc['@mozilla.org/binaryoutputstream;1'].createInstance(Ci.nsIBinaryOutputStream);
						var storageStream = Cc['@mozilla.org/storagestream;1'].createInstance(Ci.nsIStorageStream);
						storageStream.init(4096, imageData.length, null);
						binaryOutStream.setOutputStream(storageStream.getOutputStream(0));
						binaryOutStream.writeBytes(imageData, imageData.length);
						binaryOutStream.close();
						//combine
						var combinedStream = Cc['@mozilla.org/io/multiplex-input-stream;1'].createInstance(Ci.nsIMultiplexInputStream);
						combinedStream.appendStream(prefixStringInputStream);
						combinedStream.appendStream(storageStream.newInputStream(0));
						combinedStream.appendStream(suffixStringInputStream);
						formData = 'Content-Type: multipart/form-data; boundary=' + separator + '\n' + 'Content-Length: ' + combinedStream.available() + '\n\n';
						var postData = Cc['@mozilla.org/io/multiplex-input-stream;1'].createInstance(Ci.nsIMultiplexInputStream);
						var postHeader = Cc['@mozilla.org/io/string-input-stream;1'].createInstance(Ci.nsIStringInputStream);

						postHeader.setData(formData, formData.length);
						postData.appendStream(postHeader);
						postData.appendStream(combinedStream);
					}else{
						if(p.octetStream) formData = '--' + separator + cdfdname +'image"; filename="" \r\n\r\nContent-Type: application/octet-stream \r\n' + formData;

						formData = 'Content-Type: multipart/form-data; boundary=' + separator + '\n' + 'Content-Length: ' + formData.length + '\n\n' + formData;

						var postData = Cc['@mozilla.org/io/string-input-stream;1'].createInstance(Ci.nsIStringInputStream);
						postData.setData(formData, formData.length);
					}

					if(p.name == 'BaiduOCR'){
						imageObj = null;
						let xhr1 = new XMLHttpRequest();
						xhr1.open('POST', siteURL, true);
						xhr1.setRequestHeader('apikey', this.baiduApiKey);
						xhr1.onload = () => {
							let str = JSON.parse(xhr1.responseText);
							if(str.errMsg === 'success'){
								let word = [];
								for(let i of str.retData)
									word.push(i.word);
								let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
								converter.charset = 'UTF-8';
								gBrowser.loadOneTab('data:text/html;charset=UTF-8;base64,' + btoa('<textarea style="height:98%; width:100%">' + converter.ConvertFromUnicode(word.join('\n')) + '</textarea>'), null, null, null, false, false);
							}else{
								alert(str.errMsg);
							}
						}
						let data = new FormData();
						siteVars.forEach((a, b) =>{
							if(b == imgDataVar){
								if(mimetype !== 'jpeg'){
									let imageObj = new Image();
									imageObj.src = imgURL;
									let t = content.document.createElement('canvas');
									t.width = imageObj.width, t.height = imageObj.height;
									t.getContext('2d').drawImage(imageObj, 0, 0, t.width, t.height);
									dataURL = t.toDataURL('image/jpeg', 0.9).split(',', 2)[1];
									imageObj = null;
								}
								data.append(a.split('=')[0], dataURL);
							}else{
								data.append.apply(data, a.split('='))
							}
						});
						xhr1.send(data);
						return;
					}

					var flags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
					gBrowser.selectedTab = gBrowser.addTab();
					if(p.whst){
						if(!imageObj){
							imageObj = new Image();
							imageObj.src = imgURL;
						}
						siteURL += (siteURL.indexOf('?') > 0 ? '&' : '?') + 
						p.whst.replace(/\{\$([WHST])\}/g, ($0, $1) => {
							if($1 == 'W') return imageObj.width;
							else if($1 == 'H') return imageObj.height;
							else if($1 == 'S') return parseInt(size/1024);
							else if($1 == 'T') return mimetype;
						});
					}
					imageObj = null;
					gBrowser.loadURIWithFlags(siteURL, flags, Services.io.newURI(siteURL, null, null), null, postData);
				};
				reader.readAsDataURL(blob);
			};
			xhr.send(null);
		},
	};

	imageSearch.init();
})();
