/*global google*/
/*global $*/


(function () {
    'use strict';

    var map,
        searchButton = $('#searchButton'),
        input = $('#input'),
        //directionInput = $('#directionInput'),
        imageDiv = $('#imageDiv'),
        modalBody = $('#modalBody'),
        modalStartingPoint = $('.startingPointDiv'),
        directionModal = $('#myModal'),
        modalButtonDiv = $('#modalFooter'),
        locationList = $('.list-group-item'),
        locMarkers = [],
        infoWindow = new google.maps.InfoWindow({
            maxWidth: 350
        }),
        latLngBounds = new google.maps.LatLngBounds(),
        locData = [],
        i,
        currentLoc,
        directionsDisplay = new google.maps.DirectionsRenderer(),
        directionsService = new google.maps.DirectionsService();

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 35.1866173628669,
            lng: -99.4194729862213
        },
        zoom: 4
    });

    map.addListener('center_changed', function () {
        console.log(map.getCenter().lat(), map.getCenter().lng());
    });

    function removeMarkers() {
        for (i = 0; i < locMarkers.length; i++) {
            locMarkers[i].setMap(null);
        }
    }
    $(directionModal).modal('hide');
    $(input).keypress(function (event) {
        if (event.keyCode === 13) {
            $(searchButton).click();
        }
    });
    $(searchButton).click(function () {

        var q = input.val();
        $.getJSON('http://api.geonames.org/wikipediaSearch?maxRows=25&username=seisenbach&fuzzy=0.5&type=json&callback=?', {
                q: q
            },
            function (data) {
                $(imageDiv).empty();
                removeMarkers();

                data.geonames.forEach(function (location, index) {
                    console.log(location);
                    locData.push(location);
                    $(locationList).show();
                    imageDiv.append(
                        '<div class="col-xs-3 "><img id="img' + index + '" class="locationImage " src="' + (location.thumbnailImg || 'images/alt.png') + '" alt="photo goes here "class="img-responsive img-rounded" /></div>'
                    );

                    imageDiv.append(
                        '<div  class="col-xs-5 text-center textDiv"><a class= "locationText "><span id="title' + index + '" class="name ">' + location.title + '</span></a></div>'
                    );
                    imageDiv.append(
                        '<div  class="col-xs-4 directionButtonDiv"><button id="modalButton' + index + '" class="btn btn-default directionButton" type="button" data-toggle="modal" >Directions</button></div><div class="clearfix"></div>'
                    );

                    $("#img" + index).click(function () {
                        var latLng = new google.maps.LatLng(location.lat, location.lng);
                        map.panTo(latLng);
                        map.setZoom(12);
                    });
                    $("#title" + index).click(function () {
                        var latLng = new google.maps.LatLng(location.lat, location.lng);
                        map.panTo(latLng);
                        map.setZoom(12);
                    });
                    $("#modalButton" + index).click(function () {
                        $(modalBody).empty();
                        $(modalButtonDiv).empty();
                        $(directionModal).modal('show');
                        directionsDisplay.setMap(null);
                        $(modalBody).append(
                            '<div class="input-group startInput startingPointDiv"><span class="input-group-addon" id="basic-addon1"><p class="glyphicon glyphicon-home"></p></span><input id="startingPoint' + index + '" type="text" class="form-control" placeholder="Choose starting point" aria-describedby="basic-addon1"></div><div class="input-group startingPointDiv"><span class="input-group-addon" id="basic-addon1"><p class="glyphicon glyphicon-flag"></p></span><input id="directionInput" type="text" class="form-control" aria-describedby="basic-addon1" readonly></div>'
                        ).css({
                            "max-height": "400px",
                            "overflow": "hidden"
                        });
                        console.log(location.title);
                        $('#directionInput').attr("placeholder", location.title);
                        $(modalButtonDiv).append(
                            '</div><button type="button" class="btn btn-default" data-dismiss="modal">Close</button> <button id="getDirections' + index + '" type ="button" class = "btn btn-primary">Get Direction</button>'
                        );
                        $("#getDirections" + index).click(function () {
                            $(".startingPointDiv").hide();
                            $(modalStartingPoint).empty();
                            $(modalButtonDiv).empty();

                            var start = $('#startingPoint' + index).val();
                            var end = new google.maps.LatLng(location.lat, location.lng);
                            var request = {
                                origin: start,
                                destination: end,
                                travelMode: 'DRIVING'
                            };
                            directionsService.route(request, function (result, status) {
                                if (status === 'OK') {
                                    directionsDisplay.setMap(map);
                                    directionsDisplay.setPanel(document.getElementById('modalBody'));
                                    directionsDisplay.setDirections(result);
                                }
                            });
                            $(modalBody).css({
                                "max-height": "400px",
                                "overflow": "hidden",
                                "overflow-y": "scroll"
                            });
                        });

                    });

                    locMarkers.push(
                        new google.maps.Marker({
                            position: {
                                lat: location.lat,
                                lng: location.lng
                            },
                            map: map,
                            icon: {
                                url: (location.thumbnailImg || 'images/flagMarker.png'),
                                scaledSize: new google.maps.Size(32, 32)
                            }

                        }));

                    latLngBounds.extend(location);
                    map.panToBounds(latLngBounds);
                    map.setZoom(2);

                    index++;
                }); //end of data forEach
                locData.forEach(function (location) {

                    currentLoc = location;
                });
                locMarkers.forEach(function (marker, index) {
                    marker.addListener('click', function () {
                        var latLng = new google.maps.LatLng(currentLoc.lat, currentLoc.lng);
                        map.panTo(latLng);
                        map.setZoom(12);
                        infoWindow.setContent(locData[index - 1].summary + '<br/><a target="_blank" href="https://' + locData[index - 1].wikipediaUrl + '">Wikipedia</a>');
                        infoWindow.open(map, locMarkers[index - 1]);
                    });
                    /*marker.addListener('mouseover', function () {
                        infoWindow.setContent(locData[index - 1].title);
                        infoWindow.open(map, locMarkers[index - 1]);
                    });*/

                    index++;
                }); //end of locMarkers forEach

            }); //end of $.getJSON
    }); //end of click listener on search button
}());