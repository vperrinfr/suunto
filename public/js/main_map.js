var map;
var superchargers = {
    location: []
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 48.9424363, lng: 2.3171631 },
    zoom: 7
  });

console.log(superchargers.location);

}

$(document).ready(function() {
    $.ajax({
        url: "/api/list_dives"
    }).then(function(data) {
      console.log(data);
      //localStorage.setItem("dives", data);
      data.rows.forEach(function(doc) {
        //console.log(doc.id);
        var latitude = doc.doc.latitude;
        var longitude = doc.doc.longitude;
        var club = doc.doc.club;
        console.log(club);
        superchargers.location.push({
        "latitude" : latitude,
        "longitude"  : longitude,
        "Club"       : club
        });
        //console.log(superchargers.location);
      });

      superchargers.location.forEach(function(sc) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(sc.latitude, sc.longitude),
          icon: {
            url: 'http://mw1.google.com/mw-earth-vectordb/dynamic/wannacorp/template/wannadive/images/gps_exact.png',
            scaledSize: new google.maps.Size(32, 32)
          },
          map: map,
          title: sc.location,
          animation: google.maps.Animation.DROP
        });
      });
  });
});
