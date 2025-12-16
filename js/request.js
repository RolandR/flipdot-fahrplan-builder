
async function requestFahrplan(){
	
	const request = new Request("https://fahrplan.events.ccc.de/congress/2025/fahrplan/schedules/fahrplan.json");
	
	let response = await fetch(request);
	let json = await response.json();
	
	let days = json.schedule.conference.days;
	
	let talks = [];
	
	for(let day of days){
		
		let rooms = [
			"One",
			"Zero",
			"Ground",
			"Fuse",
		];
		
		for(let r of rooms){
			
			let room = day.rooms[r];
			
			for(let talk of room){
				
				talks.push(talk);
				
			}
			
		}
	}
	
	talks.sort(function(a, b){
		
		let dateA = new Date(a.date);
		let dateB = new Date(b.date);
		
		return dateA - dateB;
		
	});
	
	return talks;
}