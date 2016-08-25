/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var SunCalc = __webpack_require__(1);
	
	var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
	// [::1] is the IPv6 localhost address.
	window.location.hostname === '[::1]' ||
	// 127.0.0.1/8 is considered localhost for IPv4.
	window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));
	
	// if ('serviceWorker' in navigator &&
	//     (window.location.protocol === 'https:' || isLocalhost)) {
	//   navigator.serviceWorker.register('service-worker.js')
	//   .then(function(registration) {
	//     // updatefound is fired if service-worker.js changes.
	//     registration.onupdatefound = function() {
	//       // updatefound is also fired the very first time the SW is installed,
	//       // and there's no need to prompt for a reload at that point.
	//       // So check here to see if the page is already controlled,
	//       // i.e. whether there's an existing service worker.
	//       if (navigator.serviceWorker.controller) {
	//         // The updatefound event implies that registration.installing is set:
	//         // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
	//         var installingWorker = registration.installing;
	//
	//         installingWorker.onstatechange = function() {
	//           switch (installingWorker.state) {
	//             case 'installed':
	//               // At this point, the old content will have been purged and the
	//               // fresh content will have been added to the cache.
	//               // It's the perfect time to display a "New content is
	//               // available; please refresh." message in the page's interface.
	//               break;
	//
	//             case 'redundant':
	//               throw new Error('The installing ' +
	//                               'service worker became redundant.');
	//
	//             default:
	//               // Ignore
	//           }
	//         };
	//       }
	//     };
	//   }).catch(function(e) {
	//     console.error('Error during service worker registration:', e);
	//   });
	// }
	
	var radius = 100;
	var canvas = document.getElementById('main');
	var now = new Date();
	drawOutline(canvas, radius);
	drawLineForTime(canvas, radius, now);
	navigator.geolocation.getCurrentPosition(gotLocation, noLocation, { timeout: 60000, enableHighAccuracy: false });
	
	//Location deciders
	function gotLocation(location) {
	  var latitude = location.coords.latitude;
	  var longitude = location.coords.longitude;
	  window.localStorage.setItem('latitude', latitude);
	  window.localStorage.setItem('longitude', longitude);
	  drawSunLines(canvas, now, latitude, longitude, radius);
	}
	
	function noLocation(error) {
	  if (localStorage.getItem('latitude')) {
	    console.log('drawing from last known location', error);
	    drawSunLines(canvas, now, localStorage.getItem('latitude'), localStorage.getItem('longitude'), radius);
	  } else {
	    alert('Cannot Find Location, enable location on device');
	  }
	}
	
	//canvas draw functions
	
	//interface
	function drawOutline(canvas, radius) {
	  var ctx = canvas.getContext("2d");
	  ctx.beginPath();
	  var center = getCenter(canvas);
	  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
	  ctx.stroke();
	}
	
	function drawLineForTime(canvas, radius, time) {
	  drawLineForFraction(canvas, radius, fractionOfDay(time));
	}
	
	function drawSunLines(canvas, date, latitude, longitude, radius) {
	  var sunTimes = SunCalc.getTimes(date, latitude, longitude);
	  drawLineForTime(canvas, radius, sunTimes.sunrise);
	  drawLineForTime(canvas, radius, sunTimes.sunset);
	  drawSweep(canvas, radius, sunTimes.sunrise, sunTimes.sunset);
	}
	
	//private functions
	function drawLineForFraction(canvas, radius, fraction) {
	  var ctx = canvas.getContext("2d");
	  var center = getCenter(canvas);
	  ctx.beginPath();
	  ctx.moveTo(center.x, center.y);
	  var endPoint = pointOnOutline(fraction, radius, center);
	  ctx.lineTo(endPoint.x, endPoint.y);
	  ctx.stroke();
	}
	
	function getCenter(canvas) {
	  return { x: canvas.width / 2, y: canvas.height / 2 };
	}
	
	function drawSweep(canvas, radius, startTime, endTime) {
	  var ctx = canvas.getContext("2d");
	  var center = getCenter(canvas);
	  ctx.beginPath();
	  ctx.fillStyle = "rgba(219, 223, 99, 0.4)";
	  ctx.moveTo(center.x, center.y);
	  ctx.arc(center.x, center.y, radius, angleForTime(startTime), angleForTime(endTime));
	  ctx.moveTo(center.x, center.y);
	  ctx.fill();
	}
	
	// Pure helper functions
	function angleForFraction(fraction) {
	  return Math.PI * 2 * fraction - Math.PI / 2;
	}
	function angleForTime(time) {
	  return angleForFraction(fractionOfDay(time));
	}
	
	function fractionOfDay(time) {
	  var minutesInDay = 24 * 60;
	  var timeInMinutes = time.getHours() * 60 + time.getMinutes();
	  return timeInMinutes / minutesInDay;
	}
	
	function pointOnOutline(fraction, radius, center) {
	  var angle = angleForFraction(fraction);
	  var unadjustedCenterPoint = polarToCartesian(radius, angle);
	  return {
	    x: unadjustedCenterPoint.x + center.x,
	    y: unadjustedCenterPoint.y + center.y
	  };
	}
	
	function polarToCartesian(radius, angle) {
	  return {
	    x: radius * Math.cos(angle),
	    y: radius * Math.sin(angle)
	  };
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	 (c) 2011-2015, Vladimir Agafonkin
	 SunCalc is a JavaScript library for calculating sun/moon position and light phases.
	 https://github.com/mourner/suncalc
	*/
	
	(function () { 'use strict';
	
	// shortcuts for easier to read formulas
	
	var PI   = Math.PI,
	    sin  = Math.sin,
	    cos  = Math.cos,
	    tan  = Math.tan,
	    asin = Math.asin,
	    atan = Math.atan2,
	    acos = Math.acos,
	    rad  = PI / 180;
	
	// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas
	
	
	// date/time constants and conversions
	
	var dayMs = 1000 * 60 * 60 * 24,
	    J1970 = 2440588,
	    J2000 = 2451545;
	
	function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
	function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
	function toDays(date)   { return toJulian(date) - J2000; }
	
	
	// general calculations for position
	
	var e = rad * 23.4397; // obliquity of the Earth
	
	function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
	function declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }
	
	function azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
	function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }
	
	function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }
	
	
	// general sun calculations
	
	function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }
	
	function eclipticLongitude(M) {
	
	    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
	        P = rad * 102.9372; // perihelion of the Earth
	
	    return M + C + P + PI;
	}
	
	function sunCoords(d) {
	
	    var M = solarMeanAnomaly(d),
	        L = eclipticLongitude(M);
	
	    return {
	        dec: declination(L, 0),
	        ra: rightAscension(L, 0)
	    };
	}
	
	
	var SunCalc = {};
	
	
	// calculates sun position for a given date and latitude/longitude
	
	SunCalc.getPosition = function (date, lat, lng) {
	
	    var lw  = rad * -lng,
	        phi = rad * lat,
	        d   = toDays(date),
	
	        c  = sunCoords(d),
	        H  = siderealTime(d, lw) - c.ra;
	
	    return {
	        azimuth: azimuth(H, phi, c.dec),
	        altitude: altitude(H, phi, c.dec)
	    };
	};
	
	
	// sun times configuration (angle, morning name, evening name)
	
	var times = SunCalc.times = [
	    [-0.833, 'sunrise',       'sunset'      ],
	    [  -0.3, 'sunriseEnd',    'sunsetStart' ],
	    [    -6, 'dawn',          'dusk'        ],
	    [   -12, 'nauticalDawn',  'nauticalDusk'],
	    [   -18, 'nightEnd',      'night'       ],
	    [     6, 'goldenHourEnd', 'goldenHour'  ]
	];
	
	// adds a custom time to the times config
	
	SunCalc.addTime = function (angle, riseName, setName) {
	    times.push([angle, riseName, setName]);
	};
	
	
	// calculations for sun times
	
	var J0 = 0.0009;
	
	function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }
	
	function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
	function solarTransitJ(ds, M, L)  { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }
	
	function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }
	
	// returns set time for the given sun altitude
	function getSetJ(h, lw, phi, dec, n, M, L) {
	
	    var w = hourAngle(h, phi, dec),
	        a = approxTransit(w, lw, n);
	    return solarTransitJ(a, M, L);
	}
	
	
	// calculates sun times for a given date and latitude/longitude
	
	SunCalc.getTimes = function (date, lat, lng) {
	
	    var lw = rad * -lng,
	        phi = rad * lat,
	
	        d = toDays(date),
	        n = julianCycle(d, lw),
	        ds = approxTransit(0, lw, n),
	
	        M = solarMeanAnomaly(ds),
	        L = eclipticLongitude(M),
	        dec = declination(L, 0),
	
	        Jnoon = solarTransitJ(ds, M, L),
	
	        i, len, time, Jset, Jrise;
	
	
	    var result = {
	        solarNoon: fromJulian(Jnoon),
	        nadir: fromJulian(Jnoon - 0.5)
	    };
	
	    for (i = 0, len = times.length; i < len; i += 1) {
	        time = times[i];
	
	        Jset = getSetJ(time[0] * rad, lw, phi, dec, n, M, L);
	        Jrise = Jnoon - (Jset - Jnoon);
	
	        result[time[1]] = fromJulian(Jrise);
	        result[time[2]] = fromJulian(Jset);
	    }
	
	    return result;
	};
	
	
	// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas
	
	function moonCoords(d) { // geocentric ecliptic coordinates of the moon
	
	    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
	        M = rad * (134.963 + 13.064993 * d), // mean anomaly
	        F = rad * (93.272 + 13.229350 * d),  // mean distance
	
	        l  = L + rad * 6.289 * sin(M), // longitude
	        b  = rad * 5.128 * sin(F),     // latitude
	        dt = 385001 - 20905 * cos(M);  // distance to the moon in km
	
	    return {
	        ra: rightAscension(l, b),
	        dec: declination(l, b),
	        dist: dt
	    };
	}
	
	SunCalc.getMoonPosition = function (date, lat, lng) {
	
	    var lw  = rad * -lng,
	        phi = rad * lat,
	        d   = toDays(date),
	
	        c = moonCoords(d),
	        H = siderealTime(d, lw) - c.ra,
	        h = altitude(H, phi, c.dec);
	
	    // altitude correction for refraction
	    h = h + rad * 0.017 / tan(h + rad * 10.26 / (h + rad * 5.10));
	
	    return {
	        azimuth: azimuth(H, phi, c.dec),
	        altitude: h,
	        distance: c.dist
	    };
	};
	
	
	// calculations for illumination parameters of the moon,
	// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
	// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
	
	SunCalc.getMoonIllumination = function (date) {
	
	    var d = toDays(date),
	        s = sunCoords(d),
	        m = moonCoords(d),
	
	        sdist = 149598000, // distance from Earth to Sun in km
	
	        phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
	        inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
	        angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
	                cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));
	
	    return {
	        fraction: (1 + cos(inc)) / 2,
	        phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
	        angle: angle
	    };
	};
	
	
	function hoursLater(date, h) {
	    return new Date(date.valueOf() + h * dayMs / 24);
	}
	
	// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article
	
	SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
	    var t = new Date(date);
	    if (inUTC) t.setUTCHours(0, 0, 0, 0);
	    else t.setHours(0, 0, 0, 0);
	
	    var hc = 0.133 * rad,
	        h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
	        h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;
	
	    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
	    for (var i = 1; i <= 24; i += 2) {
	        h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
	        h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;
	
	        a = (h0 + h2) / 2 - h1;
	        b = (h2 - h0) / 2;
	        xe = -b / (2 * a);
	        ye = (a * xe + b) * xe + h1;
	        d = b * b - 4 * a * h1;
	        roots = 0;
	
	        if (d >= 0) {
	            dx = Math.sqrt(d) / (Math.abs(a) * 2);
	            x1 = xe - dx;
	            x2 = xe + dx;
	            if (Math.abs(x1) <= 1) roots++;
	            if (Math.abs(x2) <= 1) roots++;
	            if (x1 < -1) x1 = x2;
	        }
	
	        if (roots === 1) {
	            if (h0 < 0) rise = i + x1;
	            else set = i + x1;
	
	        } else if (roots === 2) {
	            rise = i + (ye < 0 ? x2 : x1);
	            set = i + (ye < 0 ? x1 : x2);
	        }
	
	        if (rise && set) break;
	
	        h0 = h2;
	    }
	
	    var result = {};
	
	    if (rise) result.rise = hoursLater(t, rise);
	    if (set) result.set = hoursLater(t, set);
	
	    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;
	
	    return result;
	};
	
	
	// export as AMD module / Node module / browser variable
	if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (SunCalc), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	else if (typeof module !== 'undefined') module.exports = SunCalc;
	else window.SunCalc = SunCalc;
	
	}());


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map