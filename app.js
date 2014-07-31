var app = angular.module('app', []);

app.run(function($rootScope){
  $rootScope.name = 'Tubby';
});

app.directive('ngStylus', function($http){
  return {
    restrict: 'A',
    link: function(scope, element){

      /*CHARACTER CATEGORISATION HELPER FUNCTIONS*/

      //Character constructor
      var Character = function(){
          this.coordinates = []; //storage for coordinates
          this.scaledCoordinates = []; //storage for coordinates scaled from 0-100
          this.relativeCoordinates = []; //storage for scaledCoordinates made relative to origin
          this.normalLength = 100; //length of normal coordinates array
          this.character = undefined; //to be defined after input
      };

      //helper functions extending the array prototype
      var getMax = function(array){
        var result = [0, 0];
        array.forEach(function(tuple, index, collection){
          result[0] = result[0] > tuple[0] ? result[0] : tuple[0];
          result[1] = result[1] > tuple[1] ? result[1] : tuple[1];
        });
        return result;
      };

      var getMin = function(array){
        var result = [0, 0];
        array.forEach(function(tuple, index, collection){
          result[0] = result[0] < tuple[0] ? result[0] : tuple[0];
          result[1] = result[1] < tuple[1] ? result[1] : tuple[1];
        });
        return result;
      };

      var flatten = function(array){
        return array.reduce(function(a, b){
          return a.concat(b);
        });
      };

      Character.prototype = {
        //function to store coordinates while user is drawing
        storeCoords: function(x, y, dx, dy){
          this.coordinates.push([x, y]); //push coordinates
        },

        //assigns the character its matching UTF code
        assignCharacter: function(character){
          this.character = character.charCodeAt(0);
          this.scaledCoordinates.unshift(character.charCodeAt(0));
        },

        //scale all coords to be between 0 and 1.
        scaleMatrix: function(){
          var max = getMax(this.coordinates);
          var min = getMin(this.coordinates);
          console.log(max, min);
          var range = [max[0] - min[0], max[1] - min[1]];

          this.scaledCoordinates = this.coordinates.map(function(tuple, index, array){
            var newTuple = [tuple[0] - min[0], tuple[1] - min[1]]; //scale all numbers down so all coords are relative to zero
            newTuple = [newTuple[0] / range[0], newTuple[1] / range[1]]; //scale all coords to vary from 0 - 1
            return newTuple;
          });
        },

        //make all coordinates relative movements from previous position
        trackingMatrix: function(){
          var that = this;
          this.relativeCoordinates = this.scaledCoordinates.map(function(tuple, index, array){
            var newTuple, previousTuple;
            if(index === 0){
              newTuple = tuple;
            }else{
              previousTuple = that.scaledCoordinates[index -1];
              newTuple = [tuple[0] - previousTuple[0], tuple[1] - previousTuple[1]];
            }
            return newTuple;
          });
        }
      };


      /*CANVAS CODE*/
      var currentCharacter = new Character(); //initialise an empty character object

      var ctx = element[0].getContext('2d'); //set up canvas
      var tracking = false; //stores tracking status, controlling reaction to mousemove events
      var prevX, prevY; //previous coordinates

      var draw = function(x, y, dx, dy){
        ctx.moveTo(x, y); // set focus to starting point
        ctx.lineTo(dx, dy); // draw to new point
        ctx.strokeStyle = '#031c67'; //set color TODO: Make configurable
        ctx.stroke(); //render the line

        currentCharacter.storeCoords(x, y, dx, dy); //store coordinates whenever we're drawing
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

        //extract important values, push to storage and get ready for new character
        if(currentCharacter.coordinates.length){
          currentCharacter.scaleMatrix();
          //currentCharacter.trackingMatrix();
          currentCharacter.scaledCoordinates = flatten(currentCharacter.scaledCoordinates);
          currentCharacter.assignCharacter(prompt('Which character did you just sketch?'));

          scope.send(currentCharacter.scaledCoordinates);

          console.log(characterStorage[characterStorage.length -1]);
          currentCharacter = new Character();
        }
      });

    },
    controller: ['$scope', '$http', function($scope, $http){
      $scope.send = function(json){

        $http.post('http://localhost:3000', json).
          success(function(data, status, headers, config) {
            console.log(status);
          }).
          error(function(data, status, headers, config) {
            console.log(status);
          });
      };
    }]
  };
});