  
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDDjLQWWlqha8u_bp9AKAxZbDsM1ChMVas",
    authDomain: "simpleweb-50bf0.firebaseapp.com",
    databaseURL: "https://simpleweb-50bf0.firebaseio.com",
    projectId: "simpleweb-50bf0",
    storageBucket: "simpleweb-50bf0.appspot.com",
    messagingSenderId: "763167151663",
    appId: "1:763167151663:web:37806abcfd0bde21c9d8da",
    measurementId: "G-9TR1V395HX"
  };
  firebase.initializeApp(config);

  const messaging = firebase.messaging();

  messaging.requestPermission().then(function() {
    //getToken(messaging);
    return messaging.getToken();
  }).then(function(token){
    console.log(token);
    getIpCliente(token, window.location.href)
  }).catch(function(err) {
        console.log('Permission denied', err);
  });

  // ForeGround
  messaging.onMessage(function (payLoad) {
    console.log(payLoad);
    notifyMe(payLoad);
  });

  function getIpCliente(token, currentUrl) {
    var info = {
      IPv4: '',
      country_name: '',
      city: ''
    }
    try {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", 'https://geolocation-db.com/json/697de680-a737-11ea-9820-af05f4014d91', false ); // false for synchronous request
      xmlHttp.send( null );
      var ressult = xmlHttp.responseText;
      info = JSON.parse(ressult);
    } catch (e) {
      console.log(e);
    }
    
    let ipAdress = info.IPv4;
    let country = info.country_name;
    if (info.city) {
      country = info.city + ' ' + info.country_name;
    }
    let ipFull = ipAdress + '/' + country;
    if (ipFull) {
      var params= {url_current: currentUrl, fcm_id: token, ip_address: ipFull};
      fetch("https://simplepage.vn/api/insertuserpushnoti", {
        method: "POST",
        body: JSON.stringify(params)
      }).then(res => {
      });
    }
  }

  function notifyMe(payload) {
    console.log(payload);
    if (!Notification) {
      console.log('Browser does not support notifications.');
    } else {
      if (Notification.permission === 'granted') {
        var notify = new Notification(payload.data.title, {
          body: payload.data.body,
          icon: payload.data.icon,
        });
        notify.onclick = function (event) {
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          window.open(JSON.parse(payload.data.data).link, '_blank');
          var params= {id: JSON.parse(payload.data.data).id_push_project};
          fetch("https://simplepage.vn/api/updatetotalclickproject", {
            method: "POST",
            body: JSON.stringify(params)
          }).then(res => {
          });
        }
      } else {
        Notification.requestPermission().then(function (p) {
          if (p === 'granted') {
            var notify = new Notification(payload.data.title, {
              body: payload.data.body,
              icon: payload.data.icon,
            });
            notify.onclick = function (event) {
              event.preventDefault(); // prevent the browser from focusing the Notification's tab
              window.open(JSON.parse(payload.data.data).link, '_blank');
              var params= {id: JSON.parse(payload.data.data).id_push_project};
              fetch("https://simplepage.vn/api/updatetotalclickproject", {
                method: "POST",
                body: JSON.stringify(params)
              }).then(res => {
              });
            }
          } else {
            console.log('User blocked notifications.');
          }
        }).catch(function (err) {
          console.error(err);
        });
      }
    }
  }
