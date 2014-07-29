var app = angular.module('app', []);

app.run(function($rootScope){
  $rootScope.name = 'Tubby';
});

app.directive('ngStylus', function(){
  return {
    restrict: 'A',
    link: function(scope, element){
      //canvas teeth here
    }
  };
});