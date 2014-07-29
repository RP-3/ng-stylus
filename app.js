var app = angular.module('app', []);

app.run(function($rootScope){
  $rootScope.name = 'Tubby';
});