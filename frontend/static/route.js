let myMap;
let routePoints = [];

function init() {
    
    myMap = new ymaps.Map("#map", {
        center: [55.76, 37.64],
        zoom: 10
    });

    myMap.events.add('click', function (e) {
        let coords = e.get('coords');
        addRoutePoint(coords);
    });
}

function addRoutePoint(coords) {
    
    let placemark = new ymaps.Placemark(coords, {
        hintContent: 'Точка маршрута',
        balloonContent: 'Координаты: ' + coords
    });

    myMap.geoObjects.add(placemark);
    routePoints.push(coords); 

    updateRoute();
}

function updateRoute() {
    if (routePoints.length < 2) {
        return; 
    }

    let multiRoute = new ymaps.multiRouter.MultiRoute({
        referencePoints: routePoints,
        params: {
            results: 1
        }
    });

    myMap.geoObjects.removeAll();
    myMap.geoObjects.add(multiRoute);

    routePoints.forEach(function (coords) {
        let placemark = new ymaps.Placemark(coords);
        myMap.geoObjects.add(placemark);
    });
}