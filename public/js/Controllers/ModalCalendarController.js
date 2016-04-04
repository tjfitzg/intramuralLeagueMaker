angular.module("contactsApp").controller('ModalCalendarController', function ($scope, $modalInstance, items) {

  
 //calendar control
  $scope.today = function() {
    $scope.date = new Date();
    $scope.hoursMins = new Date($scope.date.setHours(18,0,0,0));
  };
  $scope.today();

 //end calendar control

 //time control
  $scope.hstep = 1;
  $scope.mstep = 5;
  $scope.ismeridian = true; //normal, not military time

 //end time control

 //calculate date + time
  $scope.dateTime = $scope.date.setHours($scope.hoursMins.getHours(),$scope.hoursMins.getMinutes(),0,0)

  $scope.change = function () {
    $scope.dateTime = $scope.date.setHours($scope.hoursMins.getHours(),$scope.hoursMins.getMinutes(),0,0)
  }

  $scope.ok = function () {
    var dateTime = $scope.date;
    dateTime.setHours($scope.hoursMins.getHours(),$scope.hoursMins.getMinutes(),0,0);
    $modalInstance.close(dateTime);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };


});