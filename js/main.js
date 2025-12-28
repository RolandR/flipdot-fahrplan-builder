
main();

async function main(){

	const painter = new Painter();
	const nextButton = document.getElementById("nextButton");
	const prevButton = document.getElementById("prevButton");
	const mainEl = document.getElementById("main");
	const titleTextArea = document.getElementById("titleTextArea");
	const replacementCodeEl = document.getElementById("replacementCode");
	
	let currentEvent;
	
	await painter.init();
	let talks = await requestFahrplan();
	
	let talksIndex = 0;
	
	showEvent(talks[talksIndex]);

	nextButton.addEventListener("click", function(e){
		talksIndex++;
		
		showEvent(talks[talksIndex]);
		
	});
	
	prevButton.addEventListener("click", function(e){
		talksIndex--;
		
		showEvent(talks[talksIndex]);
		
	});
	
	titleTextArea.addEventListener("input", function(e){
		
		const newTitle = titleTextArea.value;
		
		let replacementJson = {};
		
		replacementJson[currentEvent.guid] = {};
		replacementJson[currentEvent.guid].newTitle = newTitle;
		replacementCodeEl.innerHTML = JSON.stringify(replacementJson, null, "\t");
		
		currentEvent.newTitle = newTitle;
		showEvent(currentEvent);
	});
	
	function showEvent(event){
		
		currentEvent = event;
		let eventTitle = event.title;
		
		if(event.newTitle){
			eventTitle = event.newTitle;
		}
		
		titleTextArea.value = eventTitle;
		
		painter.setAndDraw(eventTitle, "center");
		let time = event.start.split(":");
		
		document.getElementById("uhr-h").innerHTML = time[0]+".";
		document.getElementById("uhr-min").innerHTML = time[1];
		
		let room = event.room.toUpperCase();
		room = room.split("");
		
		for(let i = 0; i < 6; i++){
			
			let el = document.getElementById("char"+i);
			el.innerHTML = "";
			
			if(room[i]){
				el.innerHTML = room[i];
			}
		}
	}
	
	

}