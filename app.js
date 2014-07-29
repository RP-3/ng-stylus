var app = angular.module('app', []);

app.run(function($rootScope){
  $rootScope.name = 'Tubby';
});

app.directive('ngStylus', function(){
  return {
    restrict: 'A',
    link: function(scope, element){

      var ctx = element[0].getContext('2d'); //set up canvas
      var tracking = false; //stores tracking status, controlling reaction to mousemove events
      var prevX, prevY; //previous coordinates

      var draw = function(x, y, dx, dy){
        ctx.moveTo(x, y); // set focus to starting point
        ctx.lineTo(dx, dy); // draw to new point
        ctx.strokeStyle = '#031c67'; //set color TODO: Make configurable
        ctx.stroke(); //render the line
      };

      //add event listener to canvas (element)
      element.bind('mousedown', function(event){
        prevX = event.offsetX; //where offsetX and Y are coordinates
        prevY = event.offsetY; //from top left of canvas element

        ctx.beginPath(); //begin tracing path
        tracking = true; //tracking status to true
      });

      element.bind('mouseup', function(event){
        tracking = false; //tracking status to false
      });

      element.bind('mousemove', function(event){
        if(tracking){
          newX = event.offsetX; //get new coordinate
          newY = event.offsetY; //that the mouse just moved to

          draw(prevX, prevY, newX, newY); //follow mouse movement to new coordinate

          prevX = newX; //reset prevX and Y to newX and Y
          prevY = newY; //to be ready for the next mousemove event
        }
      });

    }
  };
});