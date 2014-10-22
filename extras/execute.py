import sys, subprocess, os, shutil

def print_usage():
    print 'Make sure you have installed nodejs and cordova-cli. \n \
            Usage: python %s [install-plugins]' % (__file__)

plugins = ['com.ibm.mobile.cordova.ibmbluemix',
        'com.ibm.mobile.cordova.ibmpush',
        'org.apache.cordova.console',
        'org.apache.cordova.inappbrowser',
        'org.apache.cordova.splashscreen',
        'org.apache.cordova.device',
        'org.apache.cordova.statusbar',
        'uk.co.whiteoctober.cordova.appversion',
        'com.phonegap.plugins.barcodescanner',
        'com.ben2.cordova.keyboard',
        'org.apache.cordova.network-information',
        'org.apache.cordova.geolocation',
        'org.apache.cordova.camera',
        'org.apache.cordova.vibration',
        'org.apache.cordova.globalization',
        'https://git.oschina.net/ubiware/cordova-ios-emailcomposer.git',
        'extras/musa-mobile-driver'
        ]

def install_plugins():
    for x in plugins:
        print 'install cordova plugin %s' % (x)
        p = subprocess.Popen('cordova plugin add %s' % (x), shell = True)
        p.wait()

def build_www(platform='ios'):
    # copy cordova.js into www
    ios_cordova_js = os.path.join(os.getcwd(), 'platforms/ios/www/cordova.js')
    dest = os.path.join(os.getcwd(), 'www/cordova.js')
    if os.path.isfile(ios_cordova_js):
        try:
            shutil.copyfile(ios_cordova_js, dest)
            p = subprocess.Popen('r.js -o www/js/app.build.js', shell = True)
            p.wait()
            os.remove(dest)
            # remove the copy in build dir
            os.remove(os.path.join(os.getcwd(), 'www-build/cordova.js'))
            print 'Done, replace www with www-build now.'
        except:
            print 'fail to copy cordova.js into www'
    else:
        print ios_cordova_js, 'does not exist.'
    # issue r.js -o www/js/app.build.js

    # print a result and reminder the Developer to replace www with www-build

if __name__ == '__main__':
    params = sys.argv[1:]
    if len(params) == 0 : print_usage()
    if 'build-www' in params: build_www()
    if 'install-plugins' in params: install_plugins()
