#!/usr/bin/env python

import os
import subprocess
import json
from subprocess import Popen, PIPE, call

envData = json.loads(Popen(['/opt/elasticbeanstalk/bin/get-config', 'environment'], stdout = PIPE).communicate()[0])

for k, v in envData.iteritems():
    os.environ[k] = v

call(["node", "/var/app/current/scripts/calculate-badges.js"])