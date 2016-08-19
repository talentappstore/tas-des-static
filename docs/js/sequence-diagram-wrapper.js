
function renderDiagram(obj) {
	// we first need to encode away the &gt; and &lt; chars we get back
	var e = document.createElement('div');
	e.innerHTML = $(obj).html();
	
	// create a div to hold the diagram
	$(obj).after("<div id='" + $(obj).attr('id') + "-diag'></div>");

	// then create diagram
	var diagram = Diagram.parse(e.childNodes[0].nodeValue);
	diagram.drawSVG($(obj).attr('id') + '-diag', {theme: 'simple'});
}	

function renderSequenceDiagrams() {
	$('.seqDiag').each(function(i, obj) {
	    renderDiagram(obj);
	});
}

