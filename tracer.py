import frida
import sys
import os

def on_message(message, data):
    if message['type'] == 'send':
        print("[*] {0}".format(message['payload']))
    else:
        print(message)

def run_cmd(cmd):
    os.system(cmd)

package_name = 'com.supercell.clashroyale'

print("[*] Killing " + package_name)
run_cmd("adb shell am force-stop " + package_name)
print("[*] Starting " + package_name)
run_cmd("adb shell monkey -p " + package_name + " -c android.intent.category.LAUNCHER 1")

process = frida.get_usb_device().attach(package_name)
print("Frida attached")
script = process.create_script(open("api.js", "r").read())
print("Script loaded")
script.on('message', on_message)
print("on_message registered within script object")
script.load()
sys.stdin.read()