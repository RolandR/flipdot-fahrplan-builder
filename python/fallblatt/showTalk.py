#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sbb_rs485
import sys
import argparse
from datetime import datetime, timezone, timedelta
from dateutil.parser import parse


def showTalk(talk):

	port = "/dev/ttyUSB0"

	text = talk["room"]
	talkTime = parse(talk["date"])

	addrs = list(range(1, 6 + 1))
	cc = sbb_rs485.PanelAlphanumControl(addresses=addrs, port=port)
	cc.connect()
	cc.set_text(text)
	cc.serial.close()

	clock = sbb_rs485.PanelClockControl(
		port=port,
		addr_hour=101,
		addr_min=102,
	)
	clock.connect()
	clock.set_time(talkTime.hour, talkTime.minute)
	clock.serial.close()