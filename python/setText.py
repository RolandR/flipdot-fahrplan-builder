#!/usr/bin/python3

import os
import sys
import math
import time
from PIL import Image
import warnings

def setText(text, params):
	
	flipdotsSpacing = 5
	
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
	
	def flowText(text, charset):
		
		textInfo = []
		text = text.split(" ")
		
		for word in text:
			wordWidth = 0
			
			for i in range(len(word)):
				if not charset[word[i]]:
					print("Missing glyph: {}".format(word[i]))
					word[i] = "?"
				wordWidth += charset[word[i]].width + 1
			
			if wordWidth > 0:
				textInfo.append({
					"text": word,
					"width": wordWidth-1,
				})
		
		lines = [
			{
				"words": [],
				"width": 0,
			},
		]
		currentLine = 0
		
		for word in textInfo:
			
			if word["width"] > params["width"]:
				print("Word is wider than flipdot: "+word["text"])
			
			if lines[currentLine] == 0:
				lines[currentLine]["words"].append(word)
				lines[currentLine]["width"] += word["width"]
			elif lines[currentLine]["width"] + (word["width"] + params["smallestWhitespace"]) <= params["width"]:
				lines[currentLine]["words"].append(word)
				lines[currentLine]["width"] += word["width"] + params["smallestWhitespace"]
			else:
				currentLine += 1
				lines.append({
					"words": [],
					"width": 0,
				})
				
				lines[currentLine]["words"].append(word)
				lines[currentLine]["width"] += word["width"]
		
		for line in lines:
			line["text"] = ""
			lineWords = []
			for word in line["words"]:
				lineWords.append(word["text"])
			line["text"] = " ".join(lineWords)
		return lines
	
	def drawText(text, x, y, image, charset):
		
		for i in range(len(text)):
			char = text[i]
			if not charset[char]:
				print("Missing glyph: {}".format(char))
				continue
				
			image.paste(charset[char], (x, y))
			x += charset[char].width + 1
			
	def drawLine(line, x, y, image, charset):
		
		for word in line["words"]:
			drawText(word["text"], x, y, image, charset)
			x += word["width"] + params["smallestWhitespace"]
	
	def drawLines(lines, flipdotImages, charset):
		for i, line in enumerate(lines):
			flipdot = math.floor(i/2)
			flipdotLine = i % 2;
			startX = math.floor(params["width"]/2 - line["width"]/2)
			
			if(flipdot < len(flipdotImages)):
				drawLine(line, startX, 9*flipdotLine, flipdotImages[flipdot], charset)
			else:
				print("Line won't fit:")
				print('"{}"'.format(line["text"]))
		
	
	def combineFlipdots(flipdotImages, flipdotsImage):
		for i, image in enumerate(flipdotImages):
			flipdotsImage.paste(image, (0, i*(params["height"]+flipdotsSpacing)))
	
	flipdotImage = Image.new("1", (params["width"], params["height"]), 0)
	
	flipdotImages = [
		flipdotImage.copy(),
		flipdotImage.copy(),
		flipdotImage.copy(),
	]
	
	flipdotsImage = Image.new("1", (params["width"], (params["height"]+flipdotsSpacing)*params["flipdotsCount"]-flipdotsSpacing), 0)
	
	charsetStartingCodepoints = [0, 8192]
	charset = buildCharset(charsetStartingCodepoints)
	
	lines = flowText(text, charset)
	
	drawLines(lines, flipdotImages, charset)
	
	combineFlipdots(flipdotImages, flipdotsImage)
	
	return flipdotsImage
	