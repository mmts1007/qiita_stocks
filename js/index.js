// https://qiita.com/settings/tokens/new からアクセストークンを発行する
// read_qiita, write_qiita スコープが必要
var BASE_URL = 'https://qiita.com/api/v2';
angular.module('underscore', []).factory('_', ['$window', function($window) {
  return $window._;
}]);

angular.module('qiitaStock', ['underscore', 'angularSpinner']).controller('indexController', function($http, $scope, _) {
  var ACCESS_TOKEN  = null;
  var USER_ID       = null;
  var DEFAULT_ITEMS = {
    list:        [],
    canRead:     false,
    canDelete:   false,
    isLoading:   false
  };
  var DEFAULT_PAGE  = {
    current: 0,
    isLast: false
  }

  $scope.items = angular.copy(DEFAULT_ITEMS);
  $scope.page  = angular.copy(DEFAULT_PAGE);

  this.setup = function() {
    ACCESS_TOKEN = $scope.accessToken;
    USER_ID      = $scope.userId;
    $scope.items = angular.copy(DEFAULT_ITEMS);
    $scope.page  = angular.copy(DEFAULT_PAGE);

    if (_.isEmpty(USER_ID)) {
      return;
    }

    $scope.items.canRead = true;
    if (!_.isEmpty(ACCESS_TOKEN)) {
      $scope.items.canDelete = true;
      $http.defaults.headers.common.Authorization = 'Bearer ' + ACCESS_TOKEN;
    }

    this.getStocks();
  }

  this.getStocks = function() {
    $scope.items.isLoading = true;
    $http.get(BASE_URL + '/users/' + USER_ID + '/stocks?page=' + ($scope.page.current + 1)).then(function(response) {
      $scope.page.current += 1;
      $scope.items.list = $scope.items.list.concat(response.data);

      // NOTE: 存在しないページをリクエストすると空配列が返却される
      if (_.isEmpty(response.data)) {
        // TODO: 最終ページの判定方法を正確に行う
        // 最終ページの次のページをリクエストして結果が空配列なら最終ページだと判断している
        $scope.page.isLast = true;
      }

      $scope.items.isLoading = false;
    });
  }

  this.releaseStock = function(itemId) {
    answer = confirm('Are you sure you want to release the stock of this item?');
    if (answer) {
      $http.delete(BASE_URL + '/items/' + itemId + '/stock').then(function() {
        alert('The release of stock is success');
        _.remove($scope.items.list, function(item) { return item.id == itemId; });
      });
    }
  };

  this.readMore = function() {
    this.getStocks();
  };
});
