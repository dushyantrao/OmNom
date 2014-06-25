Truck = function() {
    var name ="";
    var marker;
}
angular.module('TruckApp', ['ngRoute'])
        .controller('mainController', ['$scope', '$http','truckService', function($scope, $http, truckService){
            //controller here.
            $scope.App = {};

            var getgeoJSONSample = function(geoJson, n) {
                return {
                    type: "FeatureCollections" ,
                    features: _.sample(geoJson.features, n)
                }
            }

            var formatFoodItems = function(fooditems){
                return (_.sample(_.map(fooditems.split(':'), $.trim), 8)).join(", ")
            }

            var map = L.mapbox.map('map', 'prakhar.map-xt3ojyos');
            // setting up geoJSON - select a random 30 sample, which can be ratings driven later on
            $scope.jsonsample = getgeoJSONSample(geoJson, 30);
            var myLayer = L.mapbox.featureLayer($scope.jsonsample).addTo(map);
            //myLayer.setGeoJSON($scope.jsonsample);

            //add each marker to the map
            myLayer.eachLayer( function(e){
                var feature = e.feature;

                var truck = new Truck(feature);

                truck.name = e.feature.properties.name;
                truck.marker = feature;

                truckService.addTruck(truck);

                // set the tooltip content
                var popupContent = '<h1>'+e.feature.properties.name+'</h1>'+
                '<span class="address">'+e.feature.properties.address+'</span>'+
                '<p>Serves:'+ formatFoodItems(e.feature.properties.fooditems)+'</p>';

                e.bindPopup(popupContent, { closeButton: true });
            });

            //on click of the marker. AUX method. We get the truck at the "pos"
            myLayer.on('click', function(e){
                var pos = e.layer.feature.properties.name;
                var model = truckService.getTruck(pos);
                $scope.feature = model.marker;
                //i reapply the feature value everytime. else the prev value sticks
                $scope.$apply();

            });

            //twitter stuff
            function fetch(){
                $http({method:'GET',url:'https://api.twitter.com/1.1/search/tweets.json?q=%40twitterapi'})
                .success(function(data, status, headers, config){
                    $scope.tweets = data;
                })
                .error(function(data, status, headers, config){

                });
            };
        }])
        .factory('truckService',function(){
            var truckService ={};
            var truckCollection= [];

            truckService.getTruck = function(name){ return _.findWhere(truckCollection,{ name: name});};
            truckService.addTruck = function(truck){ truckCollection.push(truck)};
            truckService.length = function(){ return truckCollection.length};

            return truckService;

        })
