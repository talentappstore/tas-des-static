
function loadPage(href) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

function renderClientInclude(obj) {
	// query the data-href attribute
	var href = obj.getAttribute("data-href");
    obj.innerHTML = loadPage(href);
//	alert(loadPage(href));
}	

function renderClientIncludes() {
	$('.clientInclude').each(function(i, obj) {
	    renderClientInclude(obj);
	});
}

