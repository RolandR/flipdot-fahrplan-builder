

const params = {
	flipdotsCount: 3,
	height: 16,
	width: 84,
}

const flipdotsContainer = document.getElementById("flipdotsContainer");

drawThings();

async function drawThings(){

	const charset = await buildCharset();
	
	console.log(charset);

	let flipdots = [];

	for(let i = 0; i < params.flipdotsCount; i++){
		let flipdot = {
			
		};
		
		canvas = document.createElement("canvas");
		canvas.width = params.width;
		canvas.height = params.height;
		canvas.id = "canvas"+i;
		canvas.className = "flipdotCanvas";
		
		flipdotsContainer.appendChild(canvas);
		
		let context = canvas.getContext("2d");
		
		context.fillStyle = "rgb(50, 50, 50)";
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		flipdot.canvas = canvas;
		flipdot.context = context;
		
		flipdots[i] = flipdot;
		
	}
	
	setText("The quick brown", 0, 0);
	setText("fox jumps over", 0, 1);
	setText("a lazy", 0, 2);
	setText("dog.", 0, 3);
	setText("Hello", 20, 4);
	setText("World!", 20, 5);
	
	function setText(text, x, line){
		text = text.split("");
		
		let stringLength = 0;
		for(let i in text){
			if(charset[text[i]] === undefined){
				console.warn("Missing glyph: "+text[i]);
				continue;
			}
			
			let f = ~~(line/2);
			
			flipdots[f].context.putImageData(charset[text[i]], x+stringLength, (line%2)*9);
			stringLength += charset[text[i]].width+1;
		}
		
	}
	
}


async function buildCharset(){
	
	const charsetGridSize = 10;
	const charHeight = 7;
	
	const charsetRowCount = 16;
	const charsetColumnCount = 16;
	const charsetStartingCodepoint = 32;
	
	const request = new Request("./charset-bold.png");
	
	let charsetImage;
	
	await fetch(request)
	.then((response) => response.blob())
	.then((blob) => {
		charsetImage = blob;
	});
	
	charsetImage = await createImageBitmap(charsetImage);
	
	const charsetCanvas = document.createElement("canvas");
	charsetCanvas.id = "charsetCanvas";
	charsetCanvas.width = charsetImage.width;
	charsetCanvas.height = charsetImage.height;
	
	flipdotsContainer.appendChild(charsetCanvas);
	const charsetContext = charsetCanvas.getContext("2d");
	
	charsetContext.drawImage(charsetImage, 0, 0);
	
	let charset = {};
	let codePoint = charsetStartingCodepoint;
	
	for(let y = 0; y < charsetRowCount; y++){
		for(let x = 0; x < charsetColumnCount; x++){
			
			let widthProbe = charsetContext.getImageData(
				x*charsetGridSize,
				y*charsetGridSize+(charsetGridSize-2),
				charsetGridSize,
				1,
			);
			
			let charWidth = 1;
			
			for(let i = 0; i < widthProbe.width*4; i += 4){
				if(    widthProbe.data[i+0] == 255
					&& widthProbe.data[i+1] == 0
					&& widthProbe.data[i+2] == 0
					&& widthProbe.data[i+3] == 255){
					charWidth = ~~(i/4);
					break;
				}
			}
			
			let image = charsetContext.getImageData(
				x*charsetGridSize,
				y*charsetGridSize+(charsetGridSize-charHeight)-1,
				charWidth,
				charHeight
			);
			
			let data = new Uint8ClampedArray(image.data.length);
			
			for(let i = 0; i < data.length; i += 4){
				if(image.data[i+1] == 255){
					data[i+0] = 210;
					data[i+1] = 255;
					data[i+2] = 0;
					data[i+3] = 255;
				} else {
					data[i+0] = 50;
					data[i+1] = 50;
					data[i+2] = 50;
					data[i+3] = 255;
				}
			}
			
			charset[String.fromCodePoint(codePoint)] = new ImageData(data, image.width, image.height);
			codePoint++;
			
		}
	}
	
	return charset;
	
}