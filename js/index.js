// https://qiita.com/settings/tokens/new からアクセストークンを発行する
// read_qiita, write_qiita スコープが必要
var ACCESS_TOKEN = '';
var USER_ID      = '';
var BASE_URL     = 'https://qiita.com/api/v2';

angular.module('underscore', []).factory('_', ['$window', function($window) {
  return $window._;
}]);

angular.module('qiitaStock', ['underscore']).controller('indexController', function($http, $scope, _) {
  if (_.isEmpty(USER_ID)) {
    return;
  }

  $scope.canDelete = false;
  if (!_.isEmpty(ACCESS_TOKEN)) {
    $scope.canDelete = true;
    $http.defaults.headers.common.Authorization = 'Bearer ' + ACCESS_TOKEN;
  }

  this.deleteStock = function(itemId) {
    answer = confirm('Are you sure you want to release the stock of this item?');
    if (answer) {
      $http.delete(BASE_URL + '/items/' + itemId + '/stock').then(function() {
        alert('The release of stock is success');
        _.remove($scope.items, function(item) { return item.id == itemId; });
      });
    }
  };

  $scope.page = {};
  $http.get(BASE_URL + '/users/' + USER_ID + '/stocks').then(function(response) {
    $scope.page.current = 1;
    $scope.items = response.data;
  });

  this.readMore = function() {
    $http.get(BASE_URL + '/users/' + USER_ID + '/stocks?page=' + ($scope.page.current + 1)).then(function(response) {
      $scope.items = $scope.items.concat(response.data);
      $scope.page.current += 1;
    });
  };
});
