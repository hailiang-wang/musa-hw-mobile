# musa-hw-mobile

## Project 

* Parent

> Project https://github.com/arrking/musa-hw-doc

* Master repository

> https://github.com/arrking/musa-hw-mobile


## Development Framework - Cordova and jQuery Mobile

### About Cordova

* Offical Site 

http://cordova.apache.org

* Blog for learners 

http://rensanning.iteye.com/category/305123

### Install Cordova 

> precondition : NodeJS v0.10.22, npm v1.3.14, (Mac OS X, xCode for iOS apps)

		npm install cordova@3.4.1-0.1.0 -g

### A sample app for learners

> http://rensanning.iteye.com/blog/2021619

### Get jQuery Mobile

* API - http://jquerymobile.com

* Demo - http://demos.jquerymobile.com/1.4.3

## How to contribute to lotus lamp ?

### Get the project 

		git clone git@115.28.162.221:stonda/musa-hw-mobile.git

### Install node modules 

		cd musa-hw-mobile
		npm install

### Install cordova plugins

		cd musa-hw-mobile
		python extras/execute.py install-plugins

### Install ios-simulator

		npm install ios-sim -g

### Launch the app

		export NODE_PATH=/usr/local/lib/node_modules
		cd musa-hw-mobile
		cordova prepare ios && cordova build ios
		open platforms/ios/Snowball.xcodeproj

Then, install the app into your device or simulator.


