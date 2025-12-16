

function Painter(){

	const params = {
		flipdotsCount: 3,
		height: 16,
		width: 84,
		smallestWhitespace: 3,
	};

	const flipdotsContainer = document.getElementById("flipdotsContainer");
	let charset;
	const flipdots = [];

	async function init(){

		charset = await buildCharset();

		for(let i = 0; i < params.flipdotsCount; i++){
			let flipdot = {
				
			};
			
			let canvasContainer = document.createElement("div");
			canvasContainer.className = "flipdotCanvasContainer";
			
			let dotMask = document.createElement("div");
			dotMask.className = "flipdotMask";
			
			let canvas = document.createElement("canvas");
			canvas.width = params.width;
			canvas.height = params.height;
			canvas.id = "canvas"+i;
			canvas.className = "flipdotCanvas";
			
			canvasContainer.appendChild(dotMask);
			canvasContainer.appendChild(canvas);
			flipdotsContainer.appendChild(canvasContainer);
			
			let context = canvas.getContext("2d");
			
			context.fillStyle = "rgb(50, 50, 50)";
			context.fillRect(0, 0, canvas.width, canvas.height);
			
			flipdot.canvas = canvas;
			flipdot.context = context;
			
			flipdots[i] = flipdot;
			
		}
		
	}
	
	function setAndDraw(text, align){
		clear();
		
		let lines = flowLines(text);
		drawLines(lines, align);
	}
		
	function flowLines(text){
		
		let words = text.split(" ");
		let wordsInfo = [];
		
		for(let i in words){
			wordsInfo[i] = {
				text: words[i],
				width: 0,
			};
			
			let chars = words[i].split("");
			
			for(let c in chars){
				
				if(charset[chars[c]] === undefined){
					console.warn("Missing glyph: "
						+chars[c]+" ("+chars[c].codePointAt(0)+" - "
						+~~(chars[c].codePointAt(0)/16)+"x"
						+(chars[c].codePointAt(0)%16)+")");
					wordsInfo[i].text = wordsInfo[i].text.replace(chars[c], "?");
					chars[c] = "?";
				}
				
				wordsInfo[i].width += charset[chars[c]].width+1;
			}
			
			wordsInfo[i].width -= 1;
			
		}
		
		let lines = [
			{
				words: [],
				width: 0,
			},
		];
		
		let currentLine = 0;
		for(let i in words){
			
			if(wordsInfo[i].width > params.width){
				console.warn("Word is wider than flipdot: "+words[i]);
			}
			
			if(lines[currentLine].width == 0){
				lines[currentLine].words.push(wordsInfo[i]);
				lines[currentLine].width += wordsInfo[i].width;
			} else if(lines[currentLine].width + (wordsInfo[i].width + params.smallestWhitespace) <= params.width){
				lines[currentLine].words.push(wordsInfo[i]);
				lines[currentLine].width += (wordsInfo[i].width + params.smallestWhitespace);
			} else {
				currentLine++;
				lines.push({
					words: [],
					width: 0,
				});
				
				lines[currentLine].words.push(wordsInfo[i]);
				lines[currentLine].width += wordsInfo[i].width;
			}
		}
		
		return lines;
		
	}
	
	function drawLines(lines, align){
		
		for(let l in lines){
			
			if(~~(l/2)+1 > flipdots.length){
				console.warn("Text is too long!");
				return;
			}
			
			let drawPos = 0;
			
			if(align == "center"){
				drawPos = ~~(params.width/2 - lines[l].width/2);
			} else if(align == "right"){
				drawPos = params.width - lines[l].width;
			}
			
			for(let w in lines[l].words){
				
				let word = lines[l].words[w];
				
				drawText(word.text, drawPos, l);
				drawPos += word.width + params.smallestWhitespace;
				
			}
			
		}
		
	}
	
	function drawText(text, x, line){
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
	
	function clear(){
		for(let i in flipdots){
			let context = flipdots[i].context;
			context.fillStyle = "rgb(50, 50, 50)";
			context.fillRect(0, 0, flipdots[i].canvas.width, flipdots[i].canvas.height);
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
						data[i+0] = 255;
						data[i+1] = 252;
						data[i+2] = 90;
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
	
	
	return {
		init: init,
		setAndDraw: setAndDraw,
	};
	
}