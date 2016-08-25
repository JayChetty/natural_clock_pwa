'use strict';

var SunCalc = require('suncalc')

var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);


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
var now = new Date()
drawOutline(canvas, radius);

drawTimeLine(canvas, radius, now);
navigator.geolocation.getCurrentPosition( gotLocation, noLocation, { timeout: 60000, enableHighAccuracy: false } );

//Location deciders
function gotLocation(location){
  var latitude = location.coords.latitude
  var longitude = location.coords.longitude
  window.localStorage.setItem('latitude', latitude);
  window.localStorage.setItem('longitude', longitude);
  drawSunLines(canvas, now, latitude, longitude, radius);
}

function noLocation(error){
  if(localStorage.getItem('latitude')){
    console.log('drawing from last known location', error);
    drawSunLines(canvas, now, localStorage.getItem('latitude'), localStorage.getItem('longitude'), radius)
  }
  else{
    alert('Cannot Find Location, enable location on device');
  }
}


//canvas draw functions

//interface
function drawOutline(canvas, radius){
  var ctx = canvas.getContext("2d");
  ctx.beginPath();
  var center = getCenter(canvas);
  ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
  ctx.stroke();
}

function drawTimeLine(canvas, radius, time){
  drawLineForTime(canvas, radius, time, 3)
}

function drawSunLines(canvas, date, latitude, longitude, radius){
  var sunTimes = SunCalc.getTimes(date, latitude, longitude);
  drawLineForTime(canvas, radius, sunTimes.sunrise)
  drawLineForTime(canvas, radius, sunTimes.sunset)
  drawSweep(canvas, radius, sunTimes.sunrise, sunTimes.sunset)
}

//private functions

function drawLineForTime(canvas, radius, time, lineWidth = 1){
  drawLineForFraction(canvas, radius, fractionOfDay(time), lineWidth );
}

function drawLineForFraction(canvas, radius, fraction, lineWidth = 1){
  var ctx = canvas.getContext("2d");
  ctx.lineWidth = lineWidth;
  var center = getCenter(canvas)
  ctx.beginPath();
  ctx.moveTo(center.x,center.y);
  var endPoint = pointOnOutline(fraction, radius, center);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();
}

function getCenter(canvas){
  return { x: canvas.width/2, y: canvas.height/2 };
}

function drawSweep(canvas, radius, startTime, endTime){
  var ctx = canvas.getContext("2d");
  var center = getCenter(canvas);
  ctx.beginPath();
  ctx.fillStyle = "rgba(219, 223, 99, 0.4)";
  ctx.moveTo(center.x,center.y);
  ctx.arc(
    center.x,
    center.y,
    radius,
    angleForTime(startTime),
    angleForTime(endTime)
  );
  ctx.moveTo(center.x,center.y);
  ctx.fill();
}




// Pure helper functions
function angleForFraction(fraction){
  return( Math.PI*2 * fraction - Math.PI/2 );
}
function angleForTime(time){
  return angleForFraction( fractionOfDay(time) );
}

function fractionOfDay(time){
  var minutesInDay = 24 * 60;
  var timeInMinutes = (time.getHours() * 60) + time.getMinutes();
  return(timeInMinutes / minutesInDay);
}

function pointOnOutline(fraction, radius, center){
  var angle = angleForFraction(fraction);
  var unadjustedCenterPoint = polarToCartesian(radius, angle);
  return {
    x: unadjustedCenterPoint.x + center.x,
    y: unadjustedCenterPoint.y + center.y
  }
}

function polarToCartesian(radius, angle){
  return {
    x:radius*Math.cos(angle),
    y:radius*Math.sin(angle)
  }
}
