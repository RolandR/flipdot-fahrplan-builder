#!/usr/bin/python3

import os
import sys
import math
import time
from PIL import Image
import warnings

def setText(text, params):
	
	def buildCharset(charsetStartingCodepoints):
		
		charsetGridSize = 10
		charHeight = 7
		charsetRowCount = 16
		charsetColumnCount = 16
		
		charset = {}
		
		for startingCodepoint in charsetStartingCodepoints:
			
			charsetImage = Image.open("../charset-bold-{}.png".format(startingCodepoint)).convert("RGB")
			
			codepoint = startingCodepoint
			
			for y in range(charsetRowCount):
				for x in range(charsetColumnCount):
					symbol = chr(codepoint)
					
					posX = x*charsetGridSize
					posY = y*charsetGridSize+(charsetGridSize-charHeight-1)
					charImage = charsetImage.copy().crop((posX, posY, posX+charsetGridSize, posY+charHeight))
					
					charWidth = 0
					for x in range(charsetGridSize):
						if charImage.getpixel((x, charHeight-1)) == (255, 0, 0):
							charWidth = x
							break
					
					if charWidth == 0:
						codepoint += 1
						continue
					
					charImage = charImage.getchannel("G").crop((0, 0, charWidth, charHeight))
					
					charset[symbol] = charImage
					codepoint += 1
					
		return charset
		
	def drawText(text, x, y, image, charset):
		
		for i in range(len(text)):
			char = text[i]
			if not charset[char]:
				print("Missing glyph: {}".format(char))
				continue
				
			image.paste(charset[char], (x, y))
			x += charset[char].width + 1
		
	def combineFlipdots(flipdotImages, flipdotsImage):
		for i, image in enumerate(flipdotImages):
			flipdotsImage.paste(image, (0, i*(params["height"]+1)))
	
	flipdotImage = Image.new("1", (params["width"], params["height"]), 0)
	
	flipdotImages = [
		flipdotImage.copy(),
		flipdotImage.copy(),
		flipdotImage.copy(),
	]
	
	flipdotsImage = Image.new("1", (params["width"], (params["height"]+1)*params["flipdotsCount"]-1), 0)
	
	charsetStartingCodepoints = [0, 8192]
	charset = buildCharset(charsetStartingCodepoints)
	
	drawText(text, 0, 0, flipdotImages[0], charset)
	drawText(text, 0, 9, flipdotImages[0], charset)
	drawText(text, 0, 0, flipdotImages[1], charset)
	drawText(text, 0, 9, flipdotImages[1], charset)
	drawText(text, 0, 0, flipdotImages[2], charset)
	drawText(text, 0, 9, flipdotImages[2], charset)
	
	combineFlipdots(flipdotImages, flipdotsImage)
	
	flipdotsImage.save("outputImage.png")
	