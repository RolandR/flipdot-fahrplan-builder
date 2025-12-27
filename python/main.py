#!/usr/bin/python3

import os
import sys
import math
import time
import warnings
import serial
from PIL import Image

from setText import *
from connect import *
import fahrplan

sys.path.insert(1, './fallblatt')

from showTalk import showTalk as fallblattShowTalk

params = {
	"flipdotsCount": 3,
	"height": 16,
	"width": 84,
	"smallestWhitespace": 3,
	"largestWhitespace":8,
}

flipdots = connectFlipdots()

def displayImage(image, serialConnection):
	
	height = params["height"]
	width = params["width"]

	bufferWidth = int((width+7)/8)
	bufferSize = bufferWidth*height

	displayData = bytearray(bufferSize)
	
	for y in range(height):
		for xByte in range(bufferWidth):
			byteValue = 0;
			for bit in range(8):
				if(xByte*8+bit < width):
					if image.getpixel((xByte*8+bit, y)) != 0:
						byteValue += 2**(bit)
			displayData[y*bufferWidth+(xByte)] = byteValue;

	try:
		serialConnection.open()
		serialConnection.write(displayData)
		serialConnection.close()
	except Exception as error:
		print("nope: ", error)
		
def clear(serialConnection):
	
	height = params["height"]
	width = params["width"]

	bufferWidth = int((width+7)/8)
	bufferSize = bufferWidth*height
	
	displayData = bytearray(bufferSize)
	
	for y in range(height):
		for xByte in range(bufferWidth):
			displayData[y*bufferWidth+(xByte)] = 0;

	try:
		serialConnection.open()
		serialConnection.write(displayData)
		serialConnection.close()
	except Exception as error:
		print("nope: ", error)


def fill(serialConnection):
	
	height = params["height"]
	width = params["width"]

	bufferWidth = int((width+7)/8)
	bufferSize = bufferWidth*height
	
	displayData = bytearray(bufferSize)
	
	for y in range(height):
		for xByte in range(bufferWidth):
			displayData[y*bufferWidth+(xByte)] = 255;

	try:
		serialConnection.open()
		serialConnection.write(displayData)
		serialConnection.close()
	except Exception as error:
		print("nope: ", error)
		

def showTalk(talk):

	sleepytime = 0.5
	
	fallblattShowTalk(talk)
	
	flipdotImages = setText(talk["title"], params)
	
	fill(flipdots["Flipdot 0"])
	time.sleep(sleepytime)
	fill(flipdots["Flipdot 1"])
	time.sleep(sleepytime)
	fill(flipdots["Flipdot 2"])
	time.sleep(sleepytime)
	
	clear(flipdots["Flipdot 0"])
	time.sleep(sleepytime)
	clear(flipdots["Flipdot 1"])
	time.sleep(sleepytime)
	clear(flipdots["Flipdot 2"])
	time.sleep(sleepytime)

	#displayImage(flipdotImages[0], flipdots["Flipdot 0"])
	#time.sleep(sleepytime)

	#displayImage(flipdotImages[1], flipdots["Flipdot 1"])
	#time.sleep(sleepytime)

	#displayImage(flipdotImages[2], flipdots["Flipdot 2"])
	#time.sleep(sleepytime)
	
	#displayImage(flipdotImages[0], flipdots["Flipdot 0"])
	#time.sleep(sleepytime)

	#displayImage(flipdotImages[1], flipdots["Flipdot 1"])
	#time.sleep(sleepytime)

	#displayImage(flipdotImages[2], flipdots["Flipdot 2"])
	#time.sleep(sleepytime)
	
	

def fahrplanLoop():
	
	switchTime = 5
	
	while True:
		nextTalks = fahrplan.getTalks()
		
		fallblattShowTalk(nextTalks[0])
		
		showTalk(nextTalks[0])
		time.sleep(switchTime)
		
		showTalk(nextTalks[1])
		time.sleep(switchTime)
		
		showTalk(nextTalks[2])
		time.sleep(switchTime)
		
		showTalk(nextTalks[3])
		time.sleep(switchTime)

fahrplanLoop()