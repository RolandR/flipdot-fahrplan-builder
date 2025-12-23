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

params = {
	"flipdotsCount": 3,
	"height": 16,
	"width": 84,
	"smallestWhitespace": 3,
	"largestWhitespace":8,
}

#flipdots = connectFlipdots()

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

#setImage = setText("OpenAutoLab: photographic film processing machine. Fully automatic and DIY-friendly.", params)
#setImage = setText("Building hardware - easier than ever - harder than it should be", params)
#setImage = setText("Demystifying Fuzzer Behaviour", params)
#setImage = setText("Liberating Bluetooth on the ESP32", params)
#setImage = setText("Opening Ceremony", params)
setImage = setText("Developing New Medicines in the Age of AI and Personalized Medicine", params)
#setImage = setText("A B", params)


setImage.save("outputImage.png")
