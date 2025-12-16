
main();

async function main(){

	const painter = new Painter();
	const nextButton = document.getElementById("nextButton");
	const prevButton = document.getElementById("prevButton");
	const mainEl = document.getElementById("main");
	
	
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
	
	function showEvent(event){
		
		let eventTitle = event.title;
		
		document.getElementById("titleTextArea").innerHTML = eventTitle;
		
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