// unfinished work to allow user to subset the participants inside a sequence diagram and then have the diagram redraw itself (all client side) 

var participants = [];

	function dumpParticipantRoutings(participantRoutings) {
		var dump = '';
		for (var i = 0; i < participants.length; i++) {
			dump += participants[i] + ": " + participantRoutings[i] + '\n';
		}
		alert(dump);
	}
	
	function buildParticipantRoutings() {
		var participantRoutings = [];
		for (var i = 0; i < participants.length; i++) {
			participantRoutings[i] = $("#" + participants[i]).val();
		}
		return participantRoutings;
	}
	
	function filterInput(input, participantRoutings) {
		var output = '';
		var lines = $('#diagram1Source').html().split('\n');

		for (var i = 0; i < lines.length; i++) {
			// TDO: check the line against all routings....			
			var partsArray = lines[i].split(' ');
			if (partsArray.length == 2 && partsArray[0] == 'participant')
				participants.push(partsArray[1]);
		}
	}
	
	$(document).ready(function() {

		  // we first need to encode away the &gt; and &lt; chars we get back
		  var e = document.createElement('div');
		  e.innerHTML = $('#diagram1Source').html();
		  // then create diagram
		  var diagram = Diagram.parse(e.childNodes[0].nodeValue);
		  diagram.drawSVG('diagram1', {theme: 'simple'});
		
		// split the diagram source up into its lines
		var lines = $('#diagram1Source').html().split('\n');
		// find all lines like "participant X" and add X to the array of participants
		for (var i = 0; i < lines.length; i++) {
			var partsArray = lines[i].split(' ');
			if (partsArray.length == 2 && partsArray[0] == 'participant')
				participants.push(partsArray[1]);
		}
		
		// now create a series of selects, one per participant
		for (var i = 0; i < participants.length; i++) {
			var part = $('<div>');
			// add label
			$(part).append(document.createTextNode(participants[i]));
			// select list with choices
			var dropDown = $("<select id='" + participants[i] + "'>");
			dropDown.append($("<option>").attr('value','(hide)').text('(hide)'));
			$(participants).each(function() {
				 dropDown.append($("<option>").attr('value',this).text(this));
				});
			dropDown.prop("selectedIndex", i + 1);
			$(part).append(dropDown);
			dropDown.change(function () {
				dumpParticipantRoutings(buildParticipantRoutings());
		    });	
			$('#theForm').append(part);
		}
	});

