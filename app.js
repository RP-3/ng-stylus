var app = angular.module('app', []);

app.run(function($rootScope){
  $rootScope.name = 'Tubby';
});

app.directive('ngStylus', function(){
  return {
    restrict: 'A',
    link: function(scope, element){

      /*CHARACTER CATEGORISATION HELPER FUNCTIONS*/

      var characterStorage = []; //array in which to store saved characters

      //Character constructor
      var Character = function(){
          this.coordinates = []; //storage for coordinates
          this.normalCoordinates = []; //storage for coordinate arrays of normalised length
          this.normalLength = 200; //length of normal coordinates array
          this.character = undefined; //to be defined after input
      };

      //helper function to be "called" in the context of any array
      var average = function(){
        var sum = this.reduce(function(a, b){
          return a + b;
        });

        return sum / this.length;
      };

      Character.prototype = {
        //function to store coordinates while user is drawing
        storeCoords: function(x, y){
          if(!this.coordinates.length){
            this.coordinates.push(x, y); //push origin coordinates if nothing else
          }else{
            var tuple = [
              x - this.coordinates[this.coordinates.length -2],
              y - this.coordinates[this.coordinates.length -1]
            ];
            this.coordinates.push(tuple); //push relative coordinate deltas from here
          }
        },

        //assigns the character the its matching UTF code
        assignCharacter: function(character){
          this.character = character.charCodeAt(0);
        },

        //standardises the length of the character array, giving normalLength features
        normalise: function(){
          var co = this.coordinates; //shortcut syntax
          var newCo = this.normalCoordinates; //shortcut syntax again
          var sf = co.length / this.normalLength; //scaling factor

          while(newCo.length < this.normalLength){
            var start = Math.round(sf + newCo.length);
            var end = Math.round((sf+ newCo.length) + sf -1);
            var segment = co.slice(start, end);
            segment = average.call(segment);
            newCo.push(segment);
          }
        }
      };


      /*STANDARD CANVAS CODE*/
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

      element.bind('mouseleave', function(event){
        ctx.clearRect(0, 0, element[0].width, element[0].height); //clear canvas on mouseleave
      });

    }
  };
});