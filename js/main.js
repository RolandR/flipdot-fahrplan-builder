
main();

async function main(){

	const painter = new Painter();
	const nextButton = document.getElementById("nextButton");
	const prevButton = document.getElementById("prevButton");
	const mainEl = document.getElementById("main");
	
	
	await painter.init();
	let talks = await requestFahrplan();
	
	let talksIndex = 0;
	
	let eventTitle = talks[talksIndex].title;
	
	painter.setAndDraw(eventTitle, "center");

	nextButton.addEventListener("click", function(e){
		talksIndex++;
		
		let eventTitle = talks[talksIndex].title;
	
		painter.setAndDraw(eventTitle, "center");
		
	});
	
	prevButton.addEventListener("click", function(e){
		talksIndex++;
		
		let eventTitle = talks[talksIndex].title;
	
		painter.setAndDraw(eventTitle, "center");
		
	});
	
	

}